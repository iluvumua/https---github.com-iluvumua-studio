
"use client";

import Link from "next/link";
import React from "react";
import {
  Home,
  Menu,
  Network,
  Building2,
  FileBarChart,
  LayoutDashboard,
  Gauge,
  ShieldCheck,
} from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { UserNav } from "@/components/user-nav";
import { usePathname } from 'next/navigation';

export function Header() {
  const pathname = usePathname();
  const pathSegments = pathname.split('/').filter(Boolean);
  
  const breadcrumbTranslations: { [key: string]: string } = {
    dashboard: "Tableau de bord",
    equipment: "Équipement",
    buildings: "Bâtiments",
    meters: "Compteurs",
    billing: "Facturation",
    calcul: "Calcul",
    "add-reference": "Ajouter Référence",
    statistics: "Statistiques",
    anomalies: "Anomalies",
    admin: "Administration",
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button size="icon" variant="outline" className="sm:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Ouvrir le menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="sm:max-w-xs">
          <SheetHeader>
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          </SheetHeader>
          <nav className="grid gap-6 text-lg font-medium">
             <Link
                href="/dashboard"
                className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
              >
                <Home className="h-5 w-5 transition-all group-hover:scale-110" />
                <span className="sr-only">Application</span>
              </Link>
            <Link
              href="/dashboard"
              className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
            >
              <LayoutDashboard className="h-5 w-5" />
              Tableau de bord
            </Link>
            <Link
              href="/dashboard/equipment"
              className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
            >
              <Network className="h-5 w-5" />
              Équipement
            </Link>
            <Link href="/dashboard/buildings" className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground">
              <Building2 className="h-5 w-5" />
              Bâtiments
            </Link>
             <Link href="/dashboard/meters" className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground">
              <Gauge className="h-5 w-5" />
              Compteurs
            </Link>
            <Link
              href="/dashboard/billing"
              className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
            >
              <FileBarChart className="h-5 w-5" />
              Facturation
            </Link>
            <Link
              href="/dashboard/admin"
              className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
            >
              <ShieldCheck className="h-5 w-5" />
              Administration
            </Link>
          </nav>
        </SheetContent>
      </Sheet>
      <Breadcrumb className="hidden md:flex">
        <BreadcrumbList>
          {pathSegments.length > 0 && pathSegments[0] === 'dashboard' ? (
             <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/dashboard">Tableau de bord</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
          ) : (
             <BreadcrumbItem>
              <BreadcrumbPage>Tableau de bord</BreadcrumbPage>
            </BreadcrumbItem>
          )}

          {pathSegments.slice(1).map((segment, index) => {
             const href = `/${pathSegments.slice(0, index + 2).join('/')}`;
             const isLast = index === pathSegments.length - 2;
            return (
              <React.Fragment key={href}>
                 <BreadcrumbSeparator />
                <BreadcrumbItem>
                  {isLast ? (
                     <BreadcrumbPage>{breadcrumbTranslations[segment] || segment}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                        <Link href={href}>{breadcrumbTranslations[segment] || segment}</Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </React.Fragment>
            )
          })}
        </BreadcrumbList>
      </Breadcrumb>
      <div className="relative ml-auto flex-1 md:grow-0">
        {/* Future search bar can go here */}
      </div>
      <UserNav />
    </header>
  );
}
