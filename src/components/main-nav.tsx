"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  FileBarChart,
  LayoutDashboard,
  Network,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function MainNav({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname();

  const routes = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      active: pathname === "/dashboard",
    },
    {
      href: "/dashboard/equipment",
      label: "Equipment",
      icon: Network,
      active: pathname === "/dashboard/equipment",
    },
    {
      href: "/dashboard/buildings",
      label: "Buildings",
      icon: Building2,
      active: pathname === "/dashboard/buildings",
    },
    {
      href: "/dashboard/billing",
      label: "Billing",
      icon: FileBarChart,
      active: pathname === "/dashboard/billing",
    },
  ];

  return (
    <nav
      className={cn("flex flex-col items-center gap-4 px-2 sm:py-5", className)}
      {...props}
    >
      {routes.map((route) => (
        <Tooltip key={route.href}>
          <TooltipTrigger asChild>
            <Link
              href={route.href}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8",
                route.active && "bg-accent text-accent-foreground"
              )}
            >
              <route.icon className="h-5 w-5" />
              <span className="sr-only">{route.label}</span>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">{route.label}</TooltipContent>
        </Tooltip>
      ))}
    </nav>
  );
}
