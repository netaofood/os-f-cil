import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/ordens")({
  ssr: false,
  component: () => <Outlet />,
});
