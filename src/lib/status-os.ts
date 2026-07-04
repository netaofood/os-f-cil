export const STATUS_OS = [
  { nome: "Orçamento",     cor: "#6b7280", ordem: 0 },
  { nome: "Aberta",        cor: "#3b82f6", ordem: 1 },
  { nome: "Em andamento",  cor: "#f97316", ordem: 2 },
  { nome: "Aguardando",    cor: "#eab308", ordem: 3 },
  { nome: "Concluída",     cor: "#22c55e", ordem: 4 },
  { nome: "Cancelada",     cor: "#ef4444", ordem: 5 },
] as const;

export type StatusOSNome = typeof STATUS_OS[number]["nome"];

export function getStatusCor(nome: string): string {
  return STATUS_OS.find((s) => s.nome === nome)?.cor ?? "#6b7280";
}
