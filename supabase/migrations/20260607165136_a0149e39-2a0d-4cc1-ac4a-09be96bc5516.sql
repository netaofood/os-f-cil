
-- =========================================
-- ENUMS
-- =========================================
create type public.perfil_usuario as enum ('super_admin', 'admin', 'colaborador');
create type public.tipo_produto as enum ('produto', 'servico');
create type public.status_fatura as enum ('pendente', 'pago', 'vencido', 'cancelado');
create type public.status_agendamento as enum ('agendado', 'confirmado', 'andamento', 'concluido', 'cancelado');

-- =========================================
-- TABELAS
-- =========================================

-- empresas
create table public.empresas (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  cnpj text,
  telefone text,
  email text,
  endereco text,
  cidade text,
  estado text,
  logo_url text,
  pix text,
  banco text,
  cor_destaque text not null default '#f97316',
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.empresas to authenticated;
grant all on public.empresas to service_role;
alter table public.empresas enable row level security;

-- usuarios
create table public.usuarios (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid references public.empresas(id) on delete set null,
  auth_user_id uuid not null unique references auth.users(id) on delete cascade,
  nome text not null,
  email text,
  celular text,
  perfil public.perfil_usuario not null default 'colaborador',
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.usuarios to authenticated;
grant all on public.usuarios to service_role;
alter table public.usuarios enable row level security;

-- clientes
create table public.clientes (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas(id) on delete cascade,
  nome text not null,
  cpf text,
  telefone text,
  email text,
  cidade text,
  estado text,
  observacoes text,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.clientes to authenticated;
grant all on public.clientes to service_role;
alter table public.clientes enable row level security;

-- produtos
create table public.produtos (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas(id) on delete cascade,
  nome text not null,
  tipo public.tipo_produto not null default 'produto',
  unidade text not null default 'un',
  preco numeric(12,2) not null default 0,
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.produtos to authenticated;
grant all on public.produtos to service_role;
alter table public.produtos enable row level security;

-- status_os
create table public.status_os (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas(id) on delete cascade,
  nome text not null,
  cor text not null default '#6b7280',
  ordem integer not null default 0,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.status_os to authenticated;
grant all on public.status_os to service_role;
alter table public.status_os enable row level security;

-- formas_pagamento
create table public.formas_pagamento (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas(id) on delete cascade,
  nome text not null,
  ativo boolean not null default true
);
grant select, insert, update, delete on public.formas_pagamento to authenticated;
grant all on public.formas_pagamento to service_role;
alter table public.formas_pagamento enable row level security;

-- ordens_servico
create table public.ordens_servico (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas(id) on delete cascade,
  numero text not null,
  cliente_id uuid references public.clientes(id) on delete set null,
  diagnostico text,
  status text not null default 'aberta',
  forma_pagamento text,
  total numeric(12,2) not null default 0,
  observacoes text,
  criado_por uuid references public.usuarios(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (empresa_id, numero)
);
grant select, insert, update, delete on public.ordens_servico to authenticated;
grant all on public.ordens_servico to service_role;
alter table public.ordens_servico enable row level security;

-- itens_os
create table public.itens_os (
  id uuid primary key default gen_random_uuid(),
  os_id uuid not null references public.ordens_servico(id) on delete cascade,
  descricao text not null,
  quantidade numeric(12,3) not null default 1,
  preco_unitario numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0
);
grant select, insert, update, delete on public.itens_os to authenticated;
grant all on public.itens_os to service_role;
alter table public.itens_os enable row level security;

-- log_os
create table public.log_os (
  id uuid primary key default gen_random_uuid(),
  os_id uuid not null references public.ordens_servico(id) on delete cascade,
  usuario_id uuid references public.usuarios(id) on delete set null,
  campo_alterado text not null,
  valor_anterior text,
  valor_novo text,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.log_os to authenticated;
grant all on public.log_os to service_role;
alter table public.log_os enable row level security;

-- faturas
create table public.faturas (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas(id) on delete cascade,
  numero text not null,
  os_id uuid references public.ordens_servico(id) on delete set null,
  cliente_id uuid references public.clientes(id) on delete set null,
  cliente_nome text,
  itens jsonb not null default '[]'::jsonb,
  total numeric(12,2) not null default 0,
  forma_pagamento text,
  status public.status_fatura not null default 'pendente',
  vencimento date,
  pago_em timestamptz,
  assinatura_url text,
  link_publico_token text not null unique default encode(gen_random_bytes(16), 'hex'),
  created_at timestamptz not null default now(),
  unique (empresa_id, numero)
);
grant select, insert, update, delete on public.faturas to authenticated;
grant all on public.faturas to service_role;
alter table public.faturas enable row level security;

-- agendamentos
create table public.agendamentos (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas(id) on delete cascade,
  cliente_id uuid references public.clientes(id) on delete set null,
  servico text,
  data_hora timestamptz not null,
  duracao_minutos integer not null default 60,
  status public.status_agendamento not null default 'agendado',
  cor text not null default '#3b82f6',
  observacoes text,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.agendamentos to authenticated;
grant all on public.agendamentos to service_role;
alter table public.agendamentos enable row level security;

-- =========================================
-- SECURITY DEFINER HELPERS (sem recursão)
-- =========================================

create or replace function public.current_empresa_id()
returns uuid language sql stable security definer set search_path = public as $$
  select empresa_id from public.usuarios where auth_user_id = auth.uid() limit 1
$$;

create or replace function public.current_perfil()
returns public.perfil_usuario language sql stable security definer set search_path = public as $$
  select perfil from public.usuarios where auth_user_id = auth.uid() limit 1
$$;

create or replace function public.is_super_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(public.current_perfil() = 'super_admin', false)
$$;

create or replace function public.is_admin_or_super()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(public.current_perfil() in ('admin','super_admin'), false)
$$;

create or replace function public.same_empresa(_empresa_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.is_super_admin() or _empresa_id = public.current_empresa_id()
$$;

-- =========================================
-- TRIGGER: novo usuário em auth.users
-- =========================================

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_perfil public.perfil_usuario;
begin
  if lower(new.email) = 'netaosushibar@gmail.com' then
    v_perfil := 'super_admin';
  else
    v_perfil := 'admin';
  end if;

  insert into public.usuarios (auth_user_id, nome, email, celular, perfil)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nome', split_part(new.email, '@', 1)),
    new.email,
    new.raw_user_meta_data->>'celular',
    v_perfil
  );

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- =========================================
-- TRIGGER: updated_at da OS
-- =========================================

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger trg_ordens_servico_updated_at
before update on public.ordens_servico
for each row execute function public.set_updated_at();

-- =========================================
-- POLICIES
-- =========================================

-- empresas: super_admin tudo; admin/colab leem a própria empresa; admin pode editar
create policy "empresas: super_admin tudo" on public.empresas
  for all to authenticated using (public.is_super_admin()) with check (public.is_super_admin());

create policy "empresas: leitura por membros" on public.empresas
  for select to authenticated using (id = public.current_empresa_id());

create policy "empresas: admin atualiza propria" on public.empresas
  for update to authenticated
  using (id = public.current_empresa_id() and public.is_admin_or_super())
  with check (id = public.current_empresa_id() and public.is_admin_or_super());

-- usuarios: cada um lê o próprio registro; admins leem/escrevem usuários da própria empresa; super_admin tudo
create policy "usuarios: ver proprio" on public.usuarios
  for select to authenticated using (auth_user_id = auth.uid());

create policy "usuarios: super_admin tudo" on public.usuarios
  for all to authenticated using (public.is_super_admin()) with check (public.is_super_admin());

create policy "usuarios: admin ler propria empresa" on public.usuarios
  for select to authenticated
  using (public.is_admin_or_super() and empresa_id = public.current_empresa_id());

create policy "usuarios: admin gerencia propria empresa" on public.usuarios
  for all to authenticated
  using (public.is_admin_or_super() and empresa_id = public.current_empresa_id())
  with check (public.is_admin_or_super() and empresa_id = public.current_empresa_id());

-- Helper macro: same_empresa para tabelas filhas
-- clientes
create policy "clientes: tenant select" on public.clientes
  for select to authenticated using (public.same_empresa(empresa_id));
create policy "clientes: tenant insert" on public.clientes
  for insert to authenticated with check (public.same_empresa(empresa_id));
create policy "clientes: tenant update" on public.clientes
  for update to authenticated using (public.same_empresa(empresa_id)) with check (public.same_empresa(empresa_id));
create policy "clientes: tenant delete" on public.clientes
  for delete to authenticated using (public.same_empresa(empresa_id));

-- produtos
create policy "produtos: tenant select" on public.produtos
  for select to authenticated using (public.same_empresa(empresa_id));
create policy "produtos: admin write" on public.produtos
  for all to authenticated
  using (public.same_empresa(empresa_id) and public.is_admin_or_super())
  with check (public.same_empresa(empresa_id) and public.is_admin_or_super());
-- Colaborador também pode inserir produto novo (autocomplete), mas não editar/excluir
create policy "produtos: colab insert" on public.produtos
  for insert to authenticated with check (public.same_empresa(empresa_id));

-- status_os (somente admin)
create policy "status_os: tenant select" on public.status_os
  for select to authenticated using (public.same_empresa(empresa_id));
create policy "status_os: admin write" on public.status_os
  for all to authenticated
  using (public.same_empresa(empresa_id) and public.is_admin_or_super())
  with check (public.same_empresa(empresa_id) and public.is_admin_or_super());

-- formas_pagamento (somente admin)
create policy "formas_pagamento: tenant select" on public.formas_pagamento
  for select to authenticated using (public.same_empresa(empresa_id));
create policy "formas_pagamento: admin write" on public.formas_pagamento
  for all to authenticated
  using (public.same_empresa(empresa_id) and public.is_admin_or_super())
  with check (public.same_empresa(empresa_id) and public.is_admin_or_super());

-- ordens_servico (todos da empresa)
create policy "os: tenant select" on public.ordens_servico
  for select to authenticated using (public.same_empresa(empresa_id));
create policy "os: tenant insert" on public.ordens_servico
  for insert to authenticated with check (public.same_empresa(empresa_id));
create policy "os: tenant update" on public.ordens_servico
  for update to authenticated using (public.same_empresa(empresa_id)) with check (public.same_empresa(empresa_id));
create policy "os: tenant delete" on public.ordens_servico
  for delete to authenticated using (public.same_empresa(empresa_id));

-- itens_os (via OS pai)
create policy "itens_os: via os" on public.itens_os
  for all to authenticated
  using (exists (select 1 from public.ordens_servico o where o.id = itens_os.os_id and public.same_empresa(o.empresa_id)))
  with check (exists (select 1 from public.ordens_servico o where o.id = itens_os.os_id and public.same_empresa(o.empresa_id)));

-- log_os
create policy "log_os: via os" on public.log_os
  for all to authenticated
  using (exists (select 1 from public.ordens_servico o where o.id = log_os.os_id and public.same_empresa(o.empresa_id)))
  with check (exists (select 1 from public.ordens_servico o where o.id = log_os.os_id and public.same_empresa(o.empresa_id)));

-- faturas
create policy "faturas: tenant select" on public.faturas
  for select to authenticated using (public.same_empresa(empresa_id));
create policy "faturas: tenant insert" on public.faturas
  for insert to authenticated with check (public.same_empresa(empresa_id));
create policy "faturas: tenant update" on public.faturas
  for update to authenticated using (public.same_empresa(empresa_id)) with check (public.same_empresa(empresa_id));
create policy "faturas: tenant delete" on public.faturas
  for delete to authenticated using (public.same_empresa(empresa_id));

-- agendamentos
create policy "agendamentos: tenant select" on public.agendamentos
  for select to authenticated using (public.same_empresa(empresa_id));
create policy "agendamentos: tenant insert" on public.agendamentos
  for insert to authenticated with check (public.same_empresa(empresa_id));
create policy "agendamentos: tenant update" on public.agendamentos
  for update to authenticated using (public.same_empresa(empresa_id)) with check (public.same_empresa(empresa_id));
create policy "agendamentos: tenant delete" on public.agendamentos
  for delete to authenticated using (public.same_empresa(empresa_id));
