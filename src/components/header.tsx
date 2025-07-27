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
  Upload
} from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
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
    billing: "Facturation",
    "upload-bill": "Télécharger Facture",
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
          <nav className="grid gap-6 text-lg font-medium">
             <Link
                href="/dashboard"
                className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
              >
                <Home className="h-5 w-5 transition-all group-hover:scale-110" />
                <span className="sr-only">EnerTrack Sousse</span>
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
            <Link
              href="/dashboard/billing"
              className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
            >
              <FileBarChart className="h-5 w-5" />
              Facturation
            </Link>
             <Link
              href="/dashboard/upload-bill"
              className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
            >
              <Upload className="h-5 w-5" />
              Télécharger Facture
            </Link>
          </nav>
        </SheetContent>
      </Sheet>
      <Breadcrumb className="hidden md:flex">
        <BreadcrumbList>
          {pathSegments.length > 0 && pathSegments[0] === 'dashboard' && pathSegments.length > 1 ? (
            <>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/dashboard">Tableau de bord</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
            </>
          ) : (
             <BreadcrumbItem>
              <span className="text-foreground">Tableau de bord</span>
            </BreadcrumbItem>
          )}

          {pathSegments.slice(1).map((segment, index) => {
             const href = `/${pathSegments.slice(0, index + 2).join('/')}`;
             const isLast = index === pathSegments.length - 2;
            return (
              <React.Fragment key={href}>
                <BreadcrumbItem>
                  {isLast ? (
                     <span className="text-foreground">{breadcrumbTranslations[segment] || segment}</span>
                  ) : (
                    <BreadcrumbLink asChild>
                        <Link href={href}>{breadcrumbTranslations[segment] || segment}</Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {!isLast && <BreadcrumbSeparator />}
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
