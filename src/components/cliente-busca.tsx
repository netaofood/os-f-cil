import { useState, useRef, useEffect } from "react";
import { Plus, X, Check, User } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Cliente {
  id: string;
  nome: string;
  telefone?: string | null;
}

interface Props {
  clientes: Cliente[];
  value: string;
  onChange: (id: string) => void;
  onNovoCliente: (c: Cliente) => void;
  empresaId?: string | null;
}

export function ClienteBusca({ clientes, value, onChange, onNovoCliente, empresaId }: Props) {
  const [busca, setBusca] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNovoForm, setShowNovoForm] = useState(false);
  const [novoNome, setNovoNome] = useState("");
  const [novoTelefone, setNovoTelefone] = useState("");
  const [salvando, setSalvando] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const clienteSelecionado = clientes.find((c) => c.id === value);

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Filtra por nome ou telefone
  const filtrados = busca.trim().length === 0
    ? clientes.slice(0, 8)
    : clientes.filter((c) => {
        const b = busca.toLowerCase();
        return (
          c.nome.toLowerCase().includes(b) ||
          (c.telefone ?? "").replace(/\D/g, "").includes(busca.replace(/\D/g, ""))
        );
      }).slice(0, 8);

  function selecionar(c: Cliente) {
    onChange(c.id);
    setBusca("");
    setShowDropdown(false);
  }

  function limpar() {
    onChange("");
    setBusca("");
  }

  async function handleSalvarNovo() {
    if (!novoNome.trim()) { toast.error("Nome é obrigatório"); return; }
    if (!novoTelefone.trim()) { toast.error("Telefone é obrigatório"); return; }
    if (!empresaId) { toast.error("Empresa não identificada"); return; }

    setSalvando(true);
    const { data, error } = await supabase
      .from("clientes")
      .insert({ empresa_id: empresaId, nome: novoNome.trim(), telefone: novoTelefone.trim() })
      .select("id, nome, telefone")
      .single();
    setSalvando(false);

    if (error) { toast.error(error.message); return; }

    toast.success("Cliente cadastrado!");
    onNovoCliente(data as Cliente);
    setShowNovoForm(false);
    setNovoNome("");
    setNovoTelefone("");
    setShowDropdown(false);
  }

  return (
    <div ref={containerRef} className="space-y-2">
      {/* Campo de busca ou cliente selecionado */}
      {clienteSelecionado ? (
        <div className="flex items-center gap-2 h-10 px-3 rounded-md border border-border bg-muted/40">
          <User className="h-4 w-4 text-primary shrink-0" />
          <span className="flex-1 text-sm truncate">{clienteSelecionado.nome}</span>
          <button
            type="button"
            onClick={limpar}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="relative">
          <Input
            value={busca}
            onChange={(e) => { setBusca(e.target.value); setShowDropdown(true); }}
            onFocus={() => setShowDropdown(true)}
            placeholder="Buscar por nome ou telefone…"
            autoComplete="off"
          />

          {/* Dropdown */}
          {showDropdown && (
            <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-52 overflow-y-auto">
              {filtrados.length === 0 && busca.trim().length > 0 ? (
                <div className="px-3 py-2 text-xs text-muted-foreground">
                  Nenhum cliente encontrado.
                </div>
              ) : (
                filtrados.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); selecionar(c); }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-accent flex items-center gap-2"
                  >
                    <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <div className="min-w-0">
                      <p className="truncate font-medium">{c.nome}</p>
                      {c.telefone && (
                        <p className="text-xs text-muted-foreground">{c.telefone}</p>
                      )}
                    </div>
                  </button>
                ))
              )}

              {/* Botão novo cliente */}
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); setShowNovoForm(true); setShowDropdown(false); }}
                className="w-full text-left px-3 py-2 text-sm text-primary hover:bg-accent flex items-center gap-2 border-t border-border"
              >
                <Plus className="h-3.5 w-3.5 shrink-0" />
                Cadastrar novo cliente
              </button>
            </div>
          )}
        </div>
      )}

      {/* Formulário novo cliente */}
      {showNovoForm && (
        <div className="rounded-lg border border-primary/40 p-3 space-y-2 bg-muted/30">
          <p className="text-xs font-semibold text-primary uppercase tracking-wider">Novo cliente</p>
          <div className="space-y-1.5">
            <Label className="text-xs">Nome *</Label>
            <Input
              value={novoNome}
              onChange={(e) => setNovoNome(e.target.value)}
              placeholder="Nome completo"
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Telefone *</Label>
            <Input
              value={novoTelefone}
              onChange={(e) => setNovoTelefone(e.target.value)}
              placeholder="(00) 00000-0000"
              type="tel"
            />
          </div>
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              title="Cancelar"
              onClick={() => { setShowNovoForm(false); setNovoNome(""); setNovoTelefone(""); }}
              disabled={salvando}
              className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-muted transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
            <button
              type="button"
              title="Salvar cliente"
              onClick={handleSalvarNovo}
              disabled={salvando}
              className="h-8 w-8 flex items-center justify-center rounded-md text-white bg-primary hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              <Check className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
