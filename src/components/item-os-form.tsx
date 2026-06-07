/**
 * ItemOSForm — formulário de adição de item de OS com autocomplete de produtos/serviços.
 *
 * - Filtra o catálogo em tempo real ao digitar
 * - Se o produto não existir, aceita digitação livre e cadastra automaticamente no catálogo
 * - Ao salvar, limpa os campos e fica pronto para o próximo item
 */
import { useState, useRef, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Loader2, Check, PackagePlus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUsuario } from "@/hooks/use-current-user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface Props {
  osId: string;
  onItemAdded?: () => void;
}

interface ProdutoMin {
  id: string;
  nome: string;
  preco: number;
  unidade: string;
  tipo: "produto" | "servico";
}

const brl = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n || 0);

export function ItemOSForm({ osId, onItemAdded }: Props) {
  const { data: usuario } = useCurrentUsuario();
  const qc = useQueryClient();

  const [descricao, setDescricao] = useState("");
  const [quantidade, setQuantidade] = useState("1");
  const [precoUnitario, setPrecoUnitario] = useState("");
  const [produtoSelecionadoId, setProdutoSelecionadoId] = useState<string | null>(null);
  const [showSugestoes, setShowSugestoes] = useState(false);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: produtos = [] } = useQuery({
    queryKey: ["produtos-min"],
    queryFn: async (): Promise<ProdutoMin[]> => {
      const { data } = await supabase
        .from("produtos")
        .select("id,nome,preco,unidade,tipo")
        .eq("ativo", true)
        .order("nome");
      return (data ?? []) as ProdutoMin[];
    },
  });

  // Filtra sugestões baseado no que foi digitado
  const sugestoes = descricao.trim().length === 0
    ? produtos.slice(0, 8)
    : produtos.filter((p) =>
        p.nome.toLowerCase().includes(descricao.toLowerCase())
      ).slice(0, 8);

  // Fecha o dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSugestoes(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function selecionarProduto(p: ProdutoMin) {
    setDescricao(p.nome);
    setPrecoUnitario(String(p.preco));
    setProdutoSelecionadoId(p.id);
    setShowSugestoes(false);
    // Foca no campo quantidade
    setTimeout(() => {
      const qtdInput = containerRef.current?.querySelector<HTMLInputElement>("[data-qtd]");
      qtdInput?.focus();
      qtdInput?.select();
    }, 50);
  }

  function handleDescricaoChange(v: string) {
    setDescricao(v);
    setProdutoSelecionadoId(null); // digitação livre desmarca seleção
    setShowSugestoes(true);
  }

  async function handleSalvar() {
    const desc = descricao.trim();
    if (!desc) {
      toast.error("Informe a descrição do item");
      inputRef.current?.focus();
      return;
    }

    const qtd = Number(quantidade) || 1;
    const preco = Number(precoUnitario) || 0;

    setSaving(true);

    try {
      // 1. Se não selecionou do catálogo → cadastra produto automaticamente
      if (!produtoSelecionadoId && usuario?.empresa_id) {
        const jaExiste = produtos.find(
          (p) => p.nome.toLowerCase() === desc.toLowerCase()
        );
        if (!jaExiste) {
          const { error: prodErr } = await supabase.from("produtos").insert({
            empresa_id: usuario.empresa_id,
            nome: desc,
            preco,
            unidade: "un",
            tipo: "servico", // padrão livre → serviço
            ativo: true,
          });
          if (prodErr) {
            console.warn("Aviso: não foi possível cadastrar o produto automaticamente", prodErr.message);
          } else {
            qc.invalidateQueries({ queryKey: ["produtos-min"] });
            qc.invalidateQueries({ queryKey: ["produtos"] });
            toast.info(`"${desc}" adicionado ao catálogo de produtos/serviços`);
          }
        }
      }

      // 2. Insere o item na OS
      const { error } = await supabase.from("itens_os").insert({
        os_id: osId,
        descricao: desc,
        quantidade: qtd,
        preco_unitario: preco,
      });

      if (error) throw error;

      // 3. Invalida queries relacionadas
      qc.invalidateQueries({ queryKey: ["itens_os", osId] });
      qc.invalidateQueries({ queryKey: ["os", osId] });
      qc.invalidateQueries({ queryKey: ["log_os", osId] });
      qc.invalidateQueries({ queryKey: ["ordens"] });

      // 4. Limpa campos para o próximo item
      setDescricao("");
      setQuantidade("1");
      setPrecoUnitario("");
      setProdutoSelecionadoId(null);
      setShowSugestoes(false);
      inputRef.current?.focus();

      onItemAdded?.();
    } catch (err: any) {
      toast.error(err.message ?? "Erro ao adicionar item");
    } finally {
      setSaving(false);
    }
  }

  const produtoNaoEncontrado =
    descricao.trim().length > 0 &&
    !produtoSelecionadoId &&
    !produtos.some((p) => p.nome.toLowerCase() === descricao.trim().toLowerCase());

  return (
    <div className="space-y-3 pt-3 border-t border-border">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Adicionar item</p>

      {/* Campo descrição com autocomplete */}
      <div ref={containerRef} className="relative">
        <Label className="text-xs mb-1 block">Produto / Serviço</Label>
        <Input
          ref={inputRef}
          value={descricao}
          onChange={(e) => handleDescricaoChange(e.target.value)}
          onFocus={() => setShowSugestoes(true)}
          placeholder="Digite para buscar ou descrever livremente…"
          autoComplete="off"
        />

        {/* Dropdown de sugestões */}
        {showSugestoes && (
          <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-56 overflow-y-auto">
            {sugestoes.length === 0 && descricao.trim().length > 0 ? (
              <div className="px-3 py-2 text-xs text-muted-foreground flex items-center gap-2">
                <PackagePlus className="h-3.5 w-3.5 shrink-0" />
                Novo item — será cadastrado no catálogo ao salvar
              </div>
            ) : (
              sugestoes.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault(); // evita blur no input
                    selecionarProduto(p);
                  }}
                  className={cn(
                    "w-full text-left px-3 py-2 text-sm hover:bg-accent flex items-center justify-between gap-2",
                    produtoSelecionadoId === p.id && "bg-accent"
                  )}
                >
                  <span className="flex items-center gap-2 min-w-0">
                    {produtoSelecionadoId === p.id && (
                      <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                    )}
                    <span className="truncate">{p.nome}</span>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {p.tipo === "servico" ? "serviço" : "produto"}
                    </span>
                  </span>
                  <span className="text-xs font-medium tabular-nums shrink-0">
                    {brl(p.preco)}
                  </span>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Quantidade e preço */}
      <div className="grid grid-cols-12 gap-2 items-end">
        <div className="col-span-3">
          <Label className="text-xs mb-1 block">Qtd</Label>
          <Input
            data-qtd
            type="number"
            min="0.001"
            step="0.01"
            value={quantidade}
            onChange={(e) => setQuantidade(e.target.value)}
            onFocus={(e) => e.target.select()}
          />
        </div>
        <div className="col-span-5">
          <Label className="text-xs mb-1 block">Preço unitário</Label>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={precoUnitario}
            onChange={(e) => setPrecoUnitario(e.target.value)}
            onFocus={(e) => e.target.select()}
            placeholder="0,00"
          />
        </div>
        <div className="col-span-4">
          <Label className="text-xs mb-1 block text-transparent select-none">ação</Label>
          <Button
            className="w-full"
            onClick={handleSalvar}
            disabled={saving || !descricao.trim()}
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
            ) : (
              <Plus className="h-4 w-4 mr-1" />
            )}
            Salvar item
          </Button>
        </div>
      </div>

      {/* Aviso de cadastro automático */}
      {produtoNaoEncontrado && (
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <PackagePlus className="h-3 w-3 shrink-0" />
          Este item não está no catálogo e será cadastrado automaticamente ao salvar.
        </p>
      )}
    </div>
  );
}
