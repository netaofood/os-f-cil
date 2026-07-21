import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";

export const Route = createFileRoute("/_authenticated/faturas/$id")({
  ssr: false,
  component: FaturaDetailPage,
});

function FaturaDetailPage() {
  const { id } = Route.useParams();
  return (
    <AppShell title="Fatura">
      <p>Fatura ID: {id}</p>
    </AppShell>
  );
}
