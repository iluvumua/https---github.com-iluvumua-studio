
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  FileBarChart,
  LayoutDashboard,
  Network,
  Gauge,
  Upload,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { ImporterButton } from "./importer-button";

export function MainNav({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname();

  const routes = [
    {
      href: "/dashboard",
      label: "Tableau de bord",
      icon: LayoutDashboard,
      active: pathname === "/dashboard",
    },
    {
      href: "/dashboard/equipment",
      label: "Équipement",
      icon: Network,
      active: pathname.startsWith("/dashboard/equipment"),
    },
    {
      href: "/dashboard/buildings",
      label: "Bâtiments",
      icon: Building2,
      active: pathname.startsWith("/dashboard/buildings"),
    },
    {
      href: "/dashboard/meters",
      label: "Compteurs",
      icon: Gauge,
      active: pathname.startsWith("/dashboard/meters"),
    },
    {
      href: "/dashboard/billing",
      label: "Facturation",
      icon: FileBarChart,
      active: pathname.startsWith("/dashboard/billing"),
    },
  ];

  return (
    <nav
      className={cn("flex-1 px-4 py-4", className)}
      {...props}
    >
      <div className="flex flex-col gap-1">
      {routes.map((route) => (
        <Link
          key={route.href}
          href={route.href}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
            route.active && "bg-muted text-primary"
          )}
        >
          <route.icon className="h-4 w-4" />
          {route.label}
        </Link>
      ))}
       <ImporterButton />
      </div>
    </nav>
  );
}
