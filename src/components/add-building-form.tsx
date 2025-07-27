
"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle } from "lucide-react";
import { useUser } from "@/hooks/use-user";
import { Checkbox } from "./ui/checkbox";

export function AddBuildingForm() {
  const { user } = useUser();

  // For now, only Moyen Bâtiment can add buildings as per original logic
  // This can be adjusted based on new roles or requirements
  if (user.role !== "Moyen Bâtiment") {
    return null;
  }
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" className="h-8 gap-1">
          <PlusCircle className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Ajouter Bâtiment
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Ajouter un nouveau bâtiment</DialogTitle>
          <DialogDescription>
            Remplissez les informations du bâtiment. Cliquez sur Enregistrer lorsque vous avez terminé.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="code" className="text-right">
              Code Bâtiment
            </Label>
            <Input id="code" placeholder="ex: SO01" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Nom du Site
            </Label>
            <Input id="name" placeholder="ex: Complexe Sousse République" className="col-span-3" />
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="commune" className="text-right">
              Commune
            </Label>
            <Input id="commune" placeholder="ex: Sousse" className="col-span-3" />
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="delegation" className="text-right">
              Délégation
            </Label>
            <Input id="delegation" placeholder="ex: Sousse Medina" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="address" className="text-right">
              Adresse
            </Label>
            <Input id="address" placeholder="ex: Av de la République - Sousse 4000" className="col-span-3" />
          </div>
           <div className="grid grid-cols-4 items-start gap-4">
             <Label className="text-right pt-2">
              Nature
            </Label>
            <div className="col-span-3 flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                    <Checkbox id="nature-a" />
                    <Label htmlFor="nature-a">Administratif</Label>
                </div>
                 <div className="flex items-center space-x-2">
                    <Checkbox id="nature-t" />
                    <Label htmlFor="nature-t">Technique</Label>
                </div>
                 <div className="flex items-center space-x-2">
                    <Checkbox id="nature-c" />
                    <Label htmlFor="nature-c">Commercial</Label>
                </div>
                 <div className="flex items-center space-x-2">
                    <Checkbox id="nature-d" />
                    <Label htmlFor="nature-d">Dépôt</Label>
                </div>
            </div>
           </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="propriete" className="text-right">
              Propriété
            </Label>
            <Input id="propriete" placeholder="ex: Propriété TT" className="col-span-3" />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit">Enregistrer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
