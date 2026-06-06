import { createFileRoute } from "@tanstack/react-router";
import logoAsset from "@/assets/os-facil-logo.png.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "OS Fácil — Gestão de Ordens de Serviço" },
      { name: "description", content: "OS Fácil: gestão simples e rápida de ordens de serviço." },
      { property: "og:title", content: "OS Fácil" },
      { property: "og:description", content: "Gestão simples e rápida de ordens de serviço." },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-6 text-foreground">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 35%, oklch(0.68 0.22 245 / 0.18), transparent 70%)",
        }}
      />
      <div className="relative z-10 flex flex-col items-center text-center">
        <img
          src={logoAsset.url}
          alt="OS Fácil"
          className="w-56 md:w-72 drop-shadow-[0_0_40px_oklch(0.68_0.22_245/0.6)]"
        />
        <h1 className="sr-only">OS Fácil</h1>
        <p className="mt-8 max-w-md text-base text-muted-foreground md:text-lg">
          Gestão de Ordens de Serviço — em breve.
        </p>
      </div>
    </main>
  );
}
