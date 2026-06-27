import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard, Users, Package, Settings, LogOut,
  FileText, Calendar, Receipt, ShieldCheck,
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup,
  SidebarGroupContent, SidebarGroupLabel, SidebarHeader,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar,
} from "@/components/ui/sidebar";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUsuario } from "@/hooks/use-current-user";


const items = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Ordens de Serviço", url: "/ordens", icon: FileText },
  { title: "Faturas", url: "/faturas", icon: Receipt },
  { title: "Clientes", url: "/clientes", icon: Users },
  { title: "Produtos & Serviços", url: "/produtos", icon: Package },
  { title: "Agenda", url: "/agenda", icon: Calendar, soon: true },
  { title: "Configurações", url: "/configuracoes", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const isActive = (path: string) => pathname === path || pathname.startsWith(path + "/");
  const { data: usuario } = useCurrentUsuario();
  const isSuperAdmin = usuario?.perfil === "super_admin";

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Link to="/dashboard" className="flex items-center gap-2 px-2 py-1">
          <img src="/logo.png" alt="" className="w-8 h-8 object-contain shrink-0" />
          {!collapsed && (
            <span className="font-bold text-base text-foreground">OS Fácil</span>
          )}
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                    disabled={item.soon}
                  >
                    {item.soon ? (
                      <span className="opacity-60 cursor-not-allowed flex items-center gap-2">
                        <item.icon className="h-4 w-4" />
                        {!collapsed && (
                          <span className="flex-1">
                            {item.title}{" "}
                            <span className="text-[10px] uppercase text-muted-foreground">em breve</span>
                          </span>
                        )}
                      </span>
                    ) : (
                      <Link to={item.url} className="flex items-center gap-2">
                        <item.icon className="h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </Link>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Menu Super Admin */}
        {isSuperAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Super Admin</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive("/admin")} tooltip="Painel Admin">
                    <Link to="/admin" className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4" />
                      {!collapsed && <span>Painel Admin</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Sair"
              onClick={async () => {
                await supabase.auth.signOut();
                navigate({ to: "/auth" });
              }}
            >
              <LogOut className="h-4 w-4" />
              {!collapsed && <span>Sair</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
