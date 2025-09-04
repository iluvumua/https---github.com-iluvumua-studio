
"use client";

import { Upload } from "lucide-react";
import * as XLSX from 'xlsx';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useBuildingsStore } from "@/hooks/use-buildings-store";
import { useEquipmentStore } from "@/hooks/use-equipment-store";
import { useMetersStore } from "@/hooks/use-meters-store";
import { useBillingStore } from "@/hooks/use-billing-store";
import type { Building, Equipment, Meter, Bill } from "@/lib/types";

export function ImporterButton({ asChild = false, children }: { asChild?: boolean, children?: React.ReactNode }) {
  const { toast } = useToast();
  const { addBuilding } = useBuildingsStore();
  const { addEquipment } = useEquipmentStore();
  const { addMeter } = useMetersStore();
  const { addBill } = useBillingStore();
  
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });

          // Process sheets
          processSheet<Building>(workbook, 'Batiment', addBuilding, "Bâtiments importés");
          processSheet<Equipment>(workbook, 'Equipement', addEquipment, "Équipements importés");
          processSheet<Meter>(workbook, 'Compteur', addMeter, "Compteurs importés");
          processSheet<Bill>(workbook, 'Facture', addBill, "Factures importées");

          toast({
            title: "Importation Réussie",
            description: "Les données du fichier XLSX ont été chargées.",
          });
        } catch (error) {
          console.error("Error processing XLSX file:", error);
          toast({
            variant: "destructive",
            title: "Erreur d'Importation",
            description: "Impossible de lire le fichier. Assurez-vous que le format est correct.",
          });
        } finally {
            // Reset file input to allow re-uploading the same file
            event.target.value = '';
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };
  
  const processSheet = <T,>(workbook: XLSX.WorkBook, sheetName: string, addAction: (item: T) => void, successMessage: string) => {
    const sheet = workbook.Sheets[sheetName];
    if (sheet) {
        const jsonData = XLSX.utils.sheet_to_json<T>(sheet);
        jsonData.forEach(item => addAction(item));
        console.log(`${successMessage}:`, jsonData);
    }
  }

  const triggerImport = () => document.getElementById('xlsx-importer')?.click();

  return (
    <>
      <input
        type="file"
        id="xlsx-importer"
        className="hidden"
        accept=".xlsx, .xls"
        onChange={handleFileUpload}
      />
      {asChild ? (
         <div onClick={triggerImport} className="w-full h-full cursor-pointer">
            {children}
         </div>
      ) : (
        <Button
            size="sm"
            variant="outline"
            className="h-8 gap-1"
            onClick={triggerImport}
        >
            <Upload className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Importer
            </span>
        </Button>
      )}
    </>
  );
}
