
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
import { useBillingStore } from "@/hooks/use-billing-store";

interface EditBillFormProps {
    bill: Bill;
}

export function EditBillForm({ bill }: EditBillFormProps) {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const { updateBill } = useBillingStore();

  if (user.role !== "Financier") {
    return null;
  }
  
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const updatedBill: Bill = {
        ...bill,
        reference: formData.get('reference') as string,
        meterId: formData.get('meterId') as string,
        month: formData.get('month') as string,
        consumptionKWh: Number(formData.get('consumption')),
        amount: Number(formData.get('amount')),
    };
    updateBill(updatedBill);
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
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
                <Input id="reference" name="reference" defaultValue={bill.reference} className="col-span-3" />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="meterId" className="text-right">
                N° Compteur
                </Label>
                <Input id="meterId" name="meterId" defaultValue={bill.meterId} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="month" className="text-right">
                Mois
                </Label>
                <Input id="month" name="month" defaultValue={bill.month} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="consumption" className="text-right">
                Consommation (kWh)
                </Label>
                <Input id="consumption" name="consumption" type="number" defaultValue={bill.consumptionKWh} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="amount" className="text-right">
                Montant (TND)
                </Label>
                <Input id="amount" name="amount" type="number" defaultValue={bill.amount} className="col-span-3" />
            </div>
            </div>
            <DialogFooter>
            <Button type="submit">Enregistrer</Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
