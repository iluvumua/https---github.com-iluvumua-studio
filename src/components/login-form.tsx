"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronRight } from "lucide-react";

export function LoginForm() {
  return (
    <Card className="w-full max-w-sm shadow-2xl">
      <CardHeader>
        <CardTitle className="text-2xl">Connexion</CardTitle>
        <CardDescription>
          Entrez vos identifiants pour accéder à votre tableau de bord.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@application.com"
              required
              defaultValue="admin@application.com"
            />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center">
              <Label htmlFor="password">Mot de passe</Label>
              <Link href="#" className="ml-auto inline-block text-sm underline" prefetch={false}>
                Mot de passe oublié?
              </Link>
            </div>
            <Input id="password" type="password" required defaultValue="password" />
          </div>
          <Button type="submit" className="w-full" asChild>
            <Link href="/dashboard">Connexion <ChevronRight /></Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
