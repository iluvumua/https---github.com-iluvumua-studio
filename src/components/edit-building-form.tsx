
"use client";

import { useState } from 'react';
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
import { Pencil } from "lucide-react";
import { useUser } from "@/hooks/use-user";
import { Checkbox } from "./ui/checkbox";
import type { Building } from '@/lib/types';

interface EditBuildingFormProps {
    building: Building;
}

export function EditBuildingForm({ building }: EditBuildingFormProps) {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);

  // For now, only Moyen Bâtiment can add buildings as per original logic
  // This can be adjusted based on new roles or requirements
  if (user.role !== "Moyen Bâtiment") {
    return null;
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
       <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Modifier le bâtiment</DialogTitle>
          <DialogDescription>
            Mettez à jour les informations du bâtiment. Cliquez sur Enregistrer lorsque vous avez terminé.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="code" className="text-right">
              Code Bâtiment
            </Label>
            <Input id="code" defaultValue={building.code} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Nom du Site
            </Label>
            <Input id="name" defaultValue={building.name} className="col-span-3" />
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="commune" className="text-right">
              Commune
            </Label>
            <Input id="commune" defaultValue={building.commune} className="col-span-3" />
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="delegation" className="text-right">
              Délégation
            </Label>
            <Input id="delegation" defaultValue={building.delegation} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="address" className="text-right">
              Adresse
            </Label>
            <Input id="address" defaultValue={building.address} className="col-span-3" />
          </div>
           <div className="grid grid-cols-4 items-start gap-4">
             <Label className="text-right pt-2">
              Nature
            </Label>
            <div className="col-span-3 flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                    <Checkbox id="nature-a" defaultChecked={building.nature.includes('A')} />
                    <Label htmlFor="nature-a">Administratif</Label>
                </div>
                 <div className="flex items-center space-x-2">
                    <Checkbox id="nature-t" defaultChecked={building.nature.includes('T')} />
                    <Label htmlFor="nature-t">Technique</Label>
                </div>
                 <div className="flex items-center space-x-2">
                    <Checkbox id="nature-c" defaultChecked={building.nature.includes('C')} />
                    <Label htmlFor="nature-c">Commercial</Label>
                </div>
                 <div className="flex items-center space-x-2">
                    <Checkbox id="nature-d" defaultChecked={building.nature.includes('D')} />
                    <Label htmlFor="nature-d">Dépôt</Label>
                </div>
            </div>
           </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="propriete" className="text-right">
              Propriété
            </Label>
            <Input id="propriete" defaultValue={building.propriete} className="col-span-3" />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit">Enregistrer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
