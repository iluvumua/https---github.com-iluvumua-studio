
"use client";

import { useState } from "react";
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
import type { Bill } from "@/lib/types";

interface EditBillFormProps {
    bill: Bill;
}

export function EditBillForm({ bill }: EditBillFormProps) {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);

  if (user.role !== "Financier") {
    return null;
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Modifier la facture</DialogTitle>
          <DialogDescription>
            Mettez à jour les détails de la facture. Cliquez sur Enregistrer lorsque vous avez terminé.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="reference" className="text-right">
              N° Facture
            </Label>
            <Input id="reference" defaultValue={bill.reference} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="building" className="text-right">
              Bâtiment
            </Label>
            <Input id="building" defaultValue={bill.buildingName} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="month" className="text-right">
              Mois
            </Label>
            <Input id="month" defaultValue={bill.month} className="col-span-3" />
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="consumption" className="text-right">
              Consommation (kWh)
            </Label>
            <Input id="consumption" type="number" defaultValue={bill.consumptionKWh} className="col-span-3" />
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">
              Montant (TND)
            </Label>
            <Input id="amount" type="number" defaultValue={bill.amount} className="col-span-3" />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit">Enregistrer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
