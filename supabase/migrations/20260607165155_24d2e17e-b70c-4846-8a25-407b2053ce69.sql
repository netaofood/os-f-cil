
revoke execute on function public.current_empresa_id() from public, anon;
revoke execute on function public.current_perfil() from public, anon;
revoke execute on function public.is_super_admin() from public, anon;
revoke execute on function public.is_admin_or_super() from public, anon;
revoke execute on function public.same_empresa(uuid) from public, anon;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.set_updated_at() from public, anon, authenticated;
