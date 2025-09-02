
"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, CalendarIcon, Loader2, Save, X } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useMetersStore } from "@/hooks/use-meters-store";
import { useBillingStore } from "@/hooks/use-billing-store";
import type { Bill } from "@/lib/types";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "./ui/switch";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Separator } from "./ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { cn } from "@/lib/utils";
import { format, getYear, getMonth, parse } from "date-fns";
import { fr } from 'date-fns/locale';
import { Calendar } from "./ui/calendar";
import { useBillingSettingsStore } from "@/hooks/use-billing-settings-store";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import { Textarea } from "./ui/textarea";

const monthNames = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
];

const monthNameToNumber: { [key: string]: string } = {
  "Janvier": "01", "Février": "02", "Mars": "03", "Avril": "04", "Mai": "05", "Juin": "06",
  "Juillet": "07", "Août": "08", "Septembre": "09", "Octobre": "10", "Novembre": "11", "Décembre": "12"
};

const createBillFormSchema = (bills: Bill[], isEditMode: boolean) => z.object({
  reference: z.string().optional(),
  meterId: z.string().min(1, "Le N° de compteur est requis."),
  billDate: z.string().regex(/^(0[1-9]|1[0-2])\/\d{4}$/, "Le format doit être MM/AAAA."),
  nombreMois: z.coerce.number().optional(),
  consumptionKWh: z.coerce.number().optional(),
  amount: z.coerce.number().optional(),
  typeTension: z.enum(["Basse Tension", "Moyen Tension Forfaitaire", "Moyen Tension Tranche Horaire"]),
  convenableSTEG: z.boolean().default(false),
  montantSTEG: z.coerce.number().optional(),
  description: z.string().optional(),
  
  // Basse Tension
  ancienIndex: z.coerce.number().optional(),
  nouveauIndex: z.coerce.number().optional(),
  prix_unitaire_bt: z.coerce.number().optional(),
  redevances_fixes: z.coerce.number().optional(),
  tva_bt: z.coerce.number().optional(),
  ertt_bt: z.coerce.number().optional(),

  
  // Moyen Tension Horaire
  ancien_index_jour: z.coerce.number().optional(),
  nouveau_index_jour: z.coerce.number().optional(),
  ancien_index_pointe: z.coerce.number().optional(),
  nouveau_index_pointe: z.coerce.number().optional(),
  ancien_index_soir: z.coerce.number().optional(),
  nouveau_index_soir: z.coerce.number().optional(),
  ancien_index_nuit: z.coerce.number().optional(),
  nouveau_index_nuit: z.coerce.number().optional(),
  coefficient_jour: z.coerce.number().optional(),
  coefficient_pointe: z.coerce.number().optional(),
  coefficient_soir: z.coerce.number().optional(),
  coefficient_nuit: z.coerce.number().optional(),
  prix_unitaire_jour: z.coerce.number().optional(),
  prix_unitaire_pointe: z.coerce.number().optional(),
  prix_unitaire_soir: z.coerce.number().optional(),
  prix_unitaire_nuit: z.coerce.number().optional(),
  consommation_jour: z.coerce.number().optional(),
  consommation_pointe: z.coerce.number().optional(),
  consommation_soir: z.coerce.number().optional(),
  consommation_nuit: z.coerce.number().optional(),
  prime_puissance_mth: z.coerce.number().optional(),
  depassement_puissance: z.coerce.number().optional(),
  location_materiel: z.coerce.number().optional(),
  frais_intervention: z.coerce.number().optional(),
  frais_relance: z.coerce.number().optional(),
  frais_retard: z.coerce.number().optional(),
  tva_consommation: z.coerce.number().optional(),
  tva_redevance: z.coerce.number().optional(),
  contribution_rtt_mth: z.coerce.number().optional(),
  surtaxe_municipale_mth: z.coerce.number().optional(),

  // Moyen Tension Forfaitaire
  mtf_ancien_index: z.coerce.number().optional(),
  mtf_nouveau_index: z.coerce.number().optional(),
  coefficient_multiplicateur: z.coerce.number().optional(),
  perte_en_charge: z.coerce.number().optional(),
  perte_a_vide: z.coerce.number().optional(),
  pu_consommation: z.coerce.number().optional(),
  prime_puissance: z.coerce.number().optional(),
  tva_consommation_percent: z.coerce.number().optional(),
  tva_redevance_percent: z.coerce.number().optional(),
  contribution_rtt: z.coerce.number().optional(),
  surtaxe_municipale: z.coerce.number().optional(),
  avance_consommation: z.coerce.number().optional(),
  bonification: z.coerce.number().optional(),

}).refine(data => {
    if (data.typeTension === "Moyen Tension Forfaitaire" && data.amount === undefined && !data.pu_consommation) return false;
    return true;
}, {
    message: "Le montant est requis pour le type Forfaitaire.",
    path: ["amount"],
}).refine(data => {
    if (!data.convenableSTEG && data.montantSTEG === undefined) return false;
    return true;
}, {
    message: "Le montant STEG est requis si la facture n'est pas convenable.",
    path: ["montantSTEG"],
}).refine(data => {
    if (isEditMode) return true; // Skip validation in edit mode
    
    const [month, year] = data.billDate.split('/');
    if (!month || !year || month.length !== 2 || year.length !== 4) return true;

    const monthIndex = parseInt(month, 10) - 1;
    const monthName = monthNames[monthIndex] || 'Unknown';
    const formattedMonth = `${monthName} ${year}`;
    
    const existingBill = bills.find(b => b.meterId === data.meterId && b.month === formattedMonth);
    
    return !existingBill;
}, {
    message: "Une facture existe déjà pour ce compteur et ce mois.",
    path: ["billDate"],
});


type FormValues = z.infer<ReturnType<typeof createBillFormSchema>>;

const calculateBasseTension = (
    ancienIndex?: number, 
    nouveauIndex?: number, 
    prixUnitaire?: number,
    redevancesFixes?: number,
    tva?: number,
    ertt?: number
) => {
    const numAncienIndex = Number(ancienIndex) || 0;
    const numNouveauIndex = Number(nouveauIndex) || 0;
    const numPrixUnitaire = Number(prixUnitaire) || 0;
    const numRedevancesFixes = Number(redevancesFixes) || 0;
    const numTva = Number(tva) || 0;
    const numErtt = Number(ertt) || 0;

    let consommation = 0;
    if (numNouveauIndex >= numAncienIndex) {
        consommation = numNouveauIndex - numAncienIndex;
    } else {
        const indexLength = String(numAncienIndex).length;
        if (indexLength > 0) {
            const maxValue = Number('9'.repeat(indexLength));
            consommation = (maxValue - numAncienIndex) + numNouveauIndex + 1;
        } else {
            consommation = numNouveauIndex;
        }
    }
    
    const montant_consommation = consommation * numPrixUnitaire;
    const total_taxes = numErtt + numTva;
    const total_consommation = montant_consommation + numRedevancesFixes;
    const montant_a_payer = total_consommation + total_taxes;
    
    return { consommation, montant: parseFloat(montant_a_payer.toFixed(3)) };
}

const calculateConsumptionWithRollover = (ancien?: number, nouveau?: number): number => {
    const numAncien = Number(ancien) || 0;
    const numNouveau = Number(nouveau) || 0;

    if (numNouveau >= numAncien) {
        return numNouveau - numAncien;
    }
    const ancienStr = String(numAncien);
    if (ancienStr.length === 0) return numNouveau;
    const maxValue = parseInt('9'.repeat(ancienStr.length), 10);
    return (maxValue - numAncien) + numNouveau + 1;
};


const calculateMoyenTensionHoraire = (values: Partial<FormValues>) => {
    const consommation_jour_calc = calculateConsumptionWithRollover(values.ancien_index_jour, values.nouveau_index_jour);
    const consommation_pointe_calc = calculateConsumptionWithRollover(values.ancien_index_pointe, values.nouveau_index_pointe);
    const consommation_soir_calc = calculateConsumptionWithRollover(values.ancien_index_soir, values.nouveau_index_soir);
    const consommation_nuit_calc = calculateConsumptionWithRollover(values.ancien_index_nuit, values.nouveau_index_nuit);
    
    const consommation_jour = (Number(values.consommation_jour) || consommation_jour_calc || 0) * (Number(values.coefficient_jour) || 1);
    const consommation_pointe = (Number(values.consommation_pointe) || consommation_pointe_calc || 0) * (Number(values.coefficient_pointe) || 1);
    const consommation_soir = (Number(values.consommation_soir) || consommation_soir_calc || 0) * (Number(values.coefficient_soir) || 1);
    const consommation_nuit = (Number(values.consommation_nuit) || consommation_nuit_calc || 0) * (Number(values.coefficient_nuit) || 1);

    const totalConsumption = consommation_jour + consommation_pointe + consommation_soir + consommation_nuit;

    const montant_jour = consommation_jour * (Number(values.prix_unitaire_jour) || 0);
    const montant_pointe = consommation_pointe * (Number(values.prix_unitaire_pointe) || 0);
    const montant_soir = consommation_soir * (Number(values.prix_unitaire_soir) || 0);
    const montant_nuit = consommation_nuit * (Number(values.prix_unitaire_nuit) || 0);
    
    const subtotal = montant_jour + montant_pointe + montant_soir + montant_nuit; 

    const group1Total = (Number(values.prime_puissance_mth) || 0) +
                        (Number(values.depassement_puissance) || 0) +
                        (Number(values.location_materiel) || 0) +
                        (Number(values.frais_intervention) || 0) +
                        (Number(values.frais_relance) || 0) +
                        (Number(values.frais_retard) || 0);
    
    const group2Total = (Number(values.tva_consommation) || 0) +
                        (Number(values.tva_redevance) || 0) +
                        (Number(values.contribution_rtt_mth) || 0) +
                        (Number(values.surtaxe_municipale_mth) || 0);
    
    const finalAmount = subtotal + group1Total + group2Total;

    return { 
        consommation: totalConsumption, 
        montant: parseFloat(finalAmount.toFixed(3)),
        consommation_jour_calc,
        consommation_pointe_calc,
        consommation_soir_calc,
        consommation_nuit_calc,
    };
}

const calculateMoyenTensionForfait = (values: Partial<FormValues>) => {
    const ancien_index = Number(values.mtf_ancien_index) || 0;
    const nouveau_index = Number(values.mtf_nouveau_index) || 0;
    const coefficient_multiplicateur = Number(values.coefficient_multiplicateur) || 0;
    const perte_en_charge = Number(values.perte_en_charge) || 0;
    const perte_a_vide = Number(values.perte_a_vide) || 0;
    const pu_consommation = Number(values.pu_consommation) || 0;
    const prime_puissance = Number(values.prime_puissance) || 0;
    const tva_consommation_percent = Number(values.tva_consommation_percent) || 0;
    const tva_redevance_percent = Number(values.tva_redevance_percent) || 0;
    const contribution_rtt = Number(values.contribution_rtt) || 0;
    const surtaxe_municipale = Number(values.surtaxe_municipale) || 0;
    const avance_consommation = Number(values.avance_consommation) || 0;
    const bonification = Number(values.bonification) || 0;

    const energie_enregistree = calculateConsumptionWithRollover(ancien_index, nouveau_index) * coefficient_multiplicateur;
    const consommation_a_facturer = energie_enregistree + perte_en_charge + perte_a_vide;
    const montant_consommation = consommation_a_facturer * pu_consommation;
    const sous_total_consommation = montant_consommation;
    const total_1 = sous_total_consommation - bonification;
    const total_2 = total_1 + prime_puissance;
    const tva_consommation = total_1 * (tva_consommation_percent / 100);
    const tva_redevance = prime_puissance * (tva_redevance_percent / 100);
    const total_3 = total_2 + tva_consommation + tva_redevance + contribution_rtt + surtaxe_municipale;
    const net_a_payer = total_3 + avance_consommation;

    return { consommation: consommation_a_facturer, montant: parseFloat(net_a_payer.toFixed(3)) };
}


interface BillFormProps {
    bill?: Bill;
}

export function BillForm({ bill }: BillFormProps) {
  const isEditMode = !!bill;
  const router = useRouter();
  const searchParams = useSearchParams();
  const { meters } = useMetersStore();
  const { bills, addBill, updateBill } = useBillingStore();
  const { settings } = useBillingSettingsStore();
  const { toast } = useToast();
  
  const meterIdParam = searchParams.get('meterId');
  const monthParam = searchParams.get('month');
  const yearParam = searchParams.get('year');
  
  const formSchema = useMemo(() => createBillFormSchema(bills, isEditMode), [bills, isEditMode]);

  const defaultValues = useMemo(() => {
    let billDate = "";
    if (isEditMode && bill?.month) {
        try {
            const parsedDate = parse(bill.month, "LLLL yyyy", new Date(), { locale: fr });
            if (!isNaN(parsedDate.getTime())) {
                const month = getMonth(parsedDate) + 1;
                const year = getYear(parsedDate);
                billDate = `${month.toString().padStart(2, '0')}/${year}`;
            }
        } catch(e) {
            console.error("Error parsing date:", e);
        }
    } else if (monthParam && yearParam) {
        const monthNumber = monthNameToNumber[monthParam];
        if (monthNumber) {
            billDate = `${monthNumber}/${yearParam}`;
        }
    } else {
        const now = new Date();
        const month = getMonth(now); // 0-indexed, so we add 1 later
        const year = getYear(now);
        billDate = `${(month === 0 ? 12 : month).toString().padStart(2, '0')}/${month === 0 ? year -1 : year}`;
    }
    const initialMeterId = bill?.meterId || meterIdParam || "";
    const selectedMeter = meters.find(m => m.id === initialMeterId);

     return {
        ...bill,
        reference: bill?.reference || "",
        meterId: initialMeterId,
        billDate,
        nombreMois: bill?.nombreMois || 1,
        typeTension: bill?.typeTension || selectedMeter?.typeTension || "Basse Tension",
        convenableSTEG: bill?.convenableSTEG ?? true,
        consumptionKWh: bill?.consumptionKWh ?? 0,
        amount: bill?.amount ?? 0,
        montantSTEG: bill?.montantSTEG ?? 0,
        description: bill?.description || "",
        // BT
        ancienIndex: bill?.ancienIndex ?? 0,
        nouveauIndex: bill?.nouveauIndex ?? 0,
        prix_unitaire_bt: bill?.prix_unitaire_bt ?? settings.basseTension.prix_unitaire_bt,
        redevances_fixes: bill?.redevances_fixes ?? settings.basseTension.redevances_fixes,
        tva_bt: bill?.tva_bt ?? settings.basseTension.tva_bt,
        ertt_bt: bill?.ertt_bt ?? settings.basseTension.ertt_bt,
        // MT Horaire
        ancien_index_jour: bill?.ancien_index_jour ?? 0,
        nouveau_index_jour: bill?.nouveau_index_jour ?? 0,
        ancien_index_pointe: bill?.ancien_index_pointe ?? 0,
        nouveau_index_pointe: bill?.nouveau_index_pointe ?? 0,
        ancien_index_soir: bill?.ancien_index_soir ?? 0,
        nouveau_index_soir: bill?.nouveau_index_soir ?? 0,
        ancien_index_nuit: bill?.ancien_index_nuit ?? 0,
        nouveau_index_nuit: bill?.nouveau_index_nuit ?? 0,
        coefficient_jour: bill?.coefficient_jour ?? settings.moyenTensionHoraire.coefficient_jour,
        coefficient_pointe: bill?.coefficient_pointe ?? settings.moyenTensionHoraire.coefficient_pointe,
        coefficient_soir: bill?.coefficient_soir ?? settings.moyenTensionHoraire.coefficient_soir,
        coefficient_nuit: bill?.coefficient_nuit ?? settings.moyenTensionHoraire.coefficient_nuit,
        prix_unitaire_jour: bill?.prix_unitaire_jour ?? settings.moyenTensionHoraire.prix_unitaire_jour,
        prix_unitaire_pointe: bill?.prix_unitaire_pointe ?? settings.moyenTensionHoraire.prix_unitaire_pointe,
        prix_unitaire_soir: bill?.prix_unitaire_soir ?? settings.moyenTensionHoraire.prix_unitaire_soir,
        prix_unitaire_nuit: bill?.prix_unitaire_nuit ?? settings.moyenTensionHoraire.prix_unitaire_nuit,
        consommation_jour: bill?.consommation_jour ?? 0,
        consommation_pointe: bill?.consommation_pointe ?? 0,
        consommation_soir: bill?.consommation_soir ?? 0,
        consommation_nuit: bill?.consommation_nuit ?? 0,
        prime_puissance_mth: bill?.prime_puissance_mth ?? 0,
        depassement_puissance: bill?.depassement_puissance ?? 0,
        location_materiel: bill?.location_materiel ?? 0,
        frais_intervention: bill?.frais_intervention ?? 0,
        frais_relance: bill?.frais_relance ?? 0,
        frais_retard: bill?.frais_retard ?? 0,
        tva_consommation: bill?.tva_consommation ?? 0,
        tva_redevance: bill?.tva_redevance ?? 0,
        contribution_rtt_mth: bill?.contribution_rtt_mth ?? 0,
        surtaxe_municipale_mth: bill?.surtaxe_municipale_mth ?? 0,
        // MT Forfait
        mtf_ancien_index: bill?.mtf_ancien_index ?? 0,
        mtf_nouveau_index: bill?.mtf_nouveau_index ?? 0,
        coefficient_multiplicateur: bill?.coefficient_multiplicateur ?? settings.moyenTensionForfait.coefficient_multiplicateur,
        perte_en_charge: bill?.perte_en_charge ?? 0,
        perte_a_vide: bill?.perte_a_vide ?? 0,
        pu_consommation: bill?.pu_consommation ?? settings.moyenTensionForfait.pu_consommation,
        prime_puissance: bill?.prime_puissance ?? 0,
        tva_consommation_percent: bill?.tva_consommation_percent ?? settings.moyenTensionForfait.tva_consommation_percent,
        tva_redevance_percent: bill?.tva_redevance_percent ?? settings.moyenTensionForfait.tva_redevance_percent,
        contribution_rtt: bill?.contribution_rtt ?? 0,
        surtaxe_municipale: bill?.surtaxe_municipale ?? 0,
        avance_consommation: bill?.avance_consommation ?? 0,
        bonification: bill?.bonification ?? 0,
     }
  }, [isEditMode, bill, meterIdParam, monthParam, yearParam, meters, settings]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: 'onChange'
  });
  
  const { setValue, watch, getValues, trigger } = form;

  const watchedValues = watch();

  const getMonthNumber = useCallback((monthName: string) => {
    try {
        const date = parse(monthName, "LLLL yyyy", new Date(), { locale: fr });
        if (!isNaN(date.getTime())) {
            return date.getFullYear() * 100 + date.getMonth();
        }
    } catch(e) {}
    return 0;
  }, []);

  const previousBill = useMemo(() => {
    const { meterId, billDate } = getValues();
    if (!meterId || !billDate || billDate.length < 7) return null;
    
    const [monthStr, yearStr] = billDate.split('/');
    const currentBillDateNum = parseInt(yearStr) * 100 + (parseInt(monthStr) - 1);

    const meterBills = bills
        .filter(b => b.meterId === meterId)
        .sort((a, b) => getMonthNumber(b.month) - getMonthNumber(a.month)); // sort descending
    
    // Find the latest bill that is before the current bill's date
    const lastBill = meterBills.find(b => getMonthNumber(b.month) < currentBillDateNum);

    return lastBill || null;
  }, [getValues, bills, getMonthNumber]);


  useEffect(() => {
    const subscription = watch((values, { name, type }) => {
      if (name === 'meterId' || name === 'billDate') {
        const selectedMeter = meters.find(m => m.id === values.meterId);

        if (name === 'meterId' && selectedMeter) {
            setValue('typeTension', selectedMeter.typeTension);
        }
        
        if (isEditMode) return;
        
        const prevBill = previousBill; // from useMemo

        if (prevBill) {
            switch (prevBill.typeTension) {
                case 'Basse Tension': setValue('ancienIndex', prevBill.nouveauIndex); break;
                case 'Moyen Tension Forfaitaire': setValue('mtf_ancien_index', prevBill.mtf_nouveau_index); break;
                case 'Moyen Tension Tranche Horaire':
                    setValue('ancien_index_jour', prevBill.nouveau_index_jour);
                    setValue('ancien_index_pointe', prevBill.nouveau_index_pointe);
                    setValue('ancien_index_soir', prevBill.nouveau_index_soir);
                    setValue('ancien_index_nuit', prevBill.nouveau_index_nuit);
                    break;
            }
        } else if (selectedMeter?.indexDepart !== undefined) {
            switch (selectedMeter.typeTension) {
                case 'Basse Tension': setValue('ancienIndex', selectedMeter.indexDepart); break;
                case 'Moyen Tension Forfaitaire': setValue('mtf_ancien_index', selectedMeter.indexDepart); break;
                case 'Moyen Tension Tranche Horaire':
                    setValue('ancien_index_jour', selectedMeter.indexDepart);
                    setValue('ancien_index_pointe', 0);
                    setValue('ancien_index_soir', 0);
                    setValue('ancien_index_nuit', 0);
                    break;
            }
        } else {
            setValue('ancienIndex', 0);
            setValue('mtf_ancien_index', 0);
            setValue('ancien_index_jour', 0);
            setValue('ancien_index_pointe', 0);
            setValue('ancien_index_soir', 0);
            setValue('ancien_index_nuit', 0);
        }

      }

      // Calculation logic
      if (values.typeTension === "Basse Tension") {
          const { consommation, montant } = calculateBasseTension(values.ancienIndex, values.nouveauIndex, values.prix_unitaire_bt, values.redevances_fixes, values.tva_bt, values.ertt_bt);
          if (getValues("consumptionKWh") !== consommation) setValue("consumptionKWh", consommation, { shouldValidate: true });
          if (getValues("amount") !== montant) setValue("amount", montant, { shouldValidate: true });
      } else if (values.typeTension === "Moyen Tension Tranche Horaire") {
          const { consommation, montant, ...calcs } = calculateMoyenTensionHoraire(values);
          if (getValues("consumptionKWh") !== consommation) setValue("consumptionKWh", consommation, { shouldValidate: true });
          if (getValues("amount") !== montant) setValue("amount", montant, { shouldValidate: true });

          if (!values.consommation_jour) setValue("consommation_jour", calcs.consommation_jour_calc);
          if (!values.consommation_pointe) setValue("consommation_pointe", calcs.consommation_pointe_calc);
          if (!values.consommation_soir) setValue("consommation_soir", calcs.consommation_soir_calc);
          if (!values.consommation_nuit) setValue("consommation_nuit", calcs.consommation_nuit_calc);

      } else if (values.typeTension === "Moyen Tension Forfaitaire") {
          const { consommation, montant } = calculateMoyenTensionForfait(values);
          if (getValues("consumptionKWh") !== consommation) setValue("consumptionKWh", consommation, { shouldValidate: true });
          if (getValues("amount") !== montant) setValue("amount", montant, { shouldValidate: true });
      }
       if (name === "meterId") {
            trigger("billDate");
       } else if (name === "billDate") {
            trigger("meterId");
       }
    });
    return () => subscription.unsubscribe();
  }, [watch, setValue, getValues, trigger, isEditMode, previousBill, meters]);
  
  const selectedMeter = meters.find(m => m.id === watchedValues.meterId);

  const onSubmit = (values: FormValues) => {
    const [month, year] = values.billDate.split('/');
    const monthIndex = parseInt(month, 10) - 1;
    const monthName = monthNames[monthIndex] || 'Unknown';
    const formattedMonth = `${monthName} ${year}`;
    
    let reference = values.reference;
    if (!isEditMode && selectedMeter?.referenceFacteur) {
        const dateCode = `${month.padStart(2, '0')}${year.slice(2)}`;
        reference = `${selectedMeter.referenceFacteur}-${dateCode}`;
    }

    const billData: Bill = {
        id: isEditMode ? bill.id : `BILL-${Date.now()}`,
        reference: reference || `UNKNOWN-${Date.now()}`,
        meterId: values.meterId,
        month: formattedMonth,
        nombreMois: values.nombreMois,
        typeTension: values.typeTension,
        consumptionKWh: values.consumptionKWh ?? 0,
        amount: values.amount ?? 0,
        convenableSTEG: values.convenableSTEG,
        montantSTEG: values.montantSTEG,
        description: values.description,
        
        // BT
        ancienIndex: values.typeTension === "Basse Tension" ? values.ancienIndex : undefined,
        nouveauIndex: values.typeTension === "Basse Tension" ? values.nouveauIndex : undefined,
        prix_unitaire_bt: values.typeTension === "Basse Tension" ? values.prix_unitaire_bt : undefined,
        redevances_fixes: values.typeTension === "Basse Tension" ? values.redevances_fixes : undefined,
        tva_bt: values.typeTension === "Basse Tension" ? values.tva_bt : undefined,
        ertt_bt: values.typeTension === "Basse Tension" ? values.ertt_bt : undefined,
        
        // MT Horaire
        ancien_index_jour: values.typeTension === "Moyen Tension Tranche Horaire" ? values.ancien_index_jour : undefined,
        nouveau_index_jour: values.typeTension === "Moyen Tension Tranche Horaire" ? values.nouveau_index_jour : undefined,
        ancien_index_pointe: values.typeTension === "Moyen Tension Tranche Horaire" ? values.ancien_index_pointe : undefined,
        nouveau_index_pointe: values.typeTension === "Moyen Tension Tranche Horaire" ? values.nouveau_index_pointe : undefined,
        ancien_index_soir: values.typeTension === "Moyen Tension Tranche Horaire" ? values.ancien_index_soir : undefined,
        nouveau_index_soir: values.typeTension === "Moyen Tension Tranche Horaire" ? values.nouveau_index_soir : undefined,
        ancien_index_nuit: values.typeTension === "Moyen Tension Tranche Horaire" ? values.ancien_index_nuit : undefined,
        nouveau_index_nuit: values.typeTension === "Moyen Tension Tranche Horaire" ? values.nouveau_index_nuit : undefined,
        coefficient_jour: values.typeTension === "Moyen Tension Tranche Horaire" ? values.coefficient_jour : undefined,
        coefficient_pointe: values.typeTension === "Moyen Tension Tranche Horaire" ? values.coefficient_pointe : undefined,
        coefficient_soir: values.typeTension === "Moyen Tension Tranche Horaire" ? values.coefficient_soir : undefined,
        coefficient_nuit: values.typeTension === "Moyen Tension Tranche Horaire" ? values.coefficient_nuit : undefined,
        prix_unitaire_jour: values.typeTension === "Moyen Tension Tranche Horaire" ? values.prix_unitaire_jour : undefined,
        prix_unitaire_pointe: values.typeTension === "Moyen Tension Tranche Horaire" ? values.prix_unitaire_pointe : undefined,
        prix_unitaire_soir: values.typeTension === "Moyen Tension Tranche Horaire" ? values.prix_unitaire_soir : undefined,
        prix_unitaire_nuit: values.typeTension === "Moyen Tension Tranche Horaire" ? values.prix_unitaire_nuit : undefined,
        consommation_jour: values.typeTension === "Moyen Tension Tranche Horaire" ? values.consommation_jour : undefined,
        consommation_pointe: values.typeTension === "Moyen Tension Tranche Horaire" ? values.consommation_pointe : undefined,
        consommation_soir: values.typeTension === "Moyen Tension Tranche Horaire" ? values.consommation_soir : undefined,
        consommation_nuit: values.typeTension === "Moyen Tension Tranche Horaire" ? values.consommation_nuit : undefined,
        prime_puissance_mth: values.typeTension === "Moyen Tension Tranche Horaire" ? values.prime_puissance_mth : undefined,
        depassement_puissance: values.typeTension === "Moyen Tension Tranche Horaire" ? values.depassement_puissance : undefined,
        location_materiel: values.typeTension === "Moyen Tension Tranche Horaire" ? values.location_materiel : undefined,
        frais_intervention: values.typeTension === "Moyen Tension Tranche Horaire" ? values.frais_intervention : undefined,
        frais_relance: values.typeTension === "Moyen Tension Tranche Horaire" ? values.frais_relance : undefined,
        frais_retard: values.typeTension === "Moyen Tension Tranche Horaire" ? values.frais_retard : undefined,
        tva_consommation: values.typeTension === "Moyen Tension Tranche Horaire" ? values.tva_consommation : undefined,
        tva_redevance: values.typeTension === "Moyen Tension Tranche Horaire" ? values.tva_redevance : undefined,
        contribution_rtt_mth: values.typeTension === "Moyen Tension Tranche Horaire" ? values.contribution_rtt_mth : undefined,
        surtaxe_municipale_mth: values.typeTension === "Moyen Tension Tranche Horaire" ? values.surtaxe_municipale_mth : undefined,


        // MT Forfait
        mtf_ancien_index: values.typeTension === "Moyen Tension Forfaitaire" ? values.mtf_ancien_index : undefined,
        mtf_nouveau_index: values.typeTension === "Moyen Tension Forfaitaire" ? values.mtf_nouveau_index : undefined,
        coefficient_multiplicateur: values.typeTension === "Moyen Tension Forfaitaire" ? values.coefficient_multiplicateur : undefined,
        perte_en_charge: values.typeTension === "Moyen Tension Forfaitaire" ? values.perte_en_charge : undefined,
        perte_a_vide: values.typeTension === "Moyen Tension Forfaitaire" ? values.perte_a_vide : undefined,
        pu_consommation: values.typeTension === "Moyen Tension Forfaitaire" ? values.pu_consommation : undefined,
        prime_puissance: values.typeTension === "Moyen Tension Forfaitaire" ? values.prime_puissance : undefined,
        tva_consommation_percent: values.typeTension === "Moyen Tension Forfaitaire" ? values.tva_consommation_percent : undefined,
        tva_redevance_percent: values.typeTension === "Moyen Tension Forfaitaire" ? values.tva_redevance_percent : undefined,
        contribution_rtt: values.typeTension === "Moyen Tension Forfaitaire" ? values.contribution_rtt : undefined,
        surtaxe_municipale: values.typeTension === "Moyen Tension Forfaitaire" ? values.surtaxe_municipale : undefined,
        avance_consommation: values.typeTension === "Moyen Tension Forfaitaire" ? values.avance_consommation : undefined,
        bonification: values.typeTension === "Moyen Tension Forfaitaire" ? values.bonification : undefined,
    };

    if (isEditMode) {
        updateBill(billData);
        toast({ title: "Facture modifiée", description: "La facture a été mise à jour avec succès." });
    } else {
        addBill(billData);
        toast({ title: "Facture ajoutée", description: "La nouvelle facture a été enregistrée avec succès." });
    }
    router.push(`/dashboard/billing`);
  }
  
  const isCalculated = watchedValues.typeTension === 'Basse Tension' || watchedValues.typeTension === 'Moyen Tension Tranche Horaire' || watchedValues.typeTension === 'Moyen Tension Forfaitaire';
  const cancelHref = '/dashboard/billing';
  
  const difference = (Number(watchedValues.montantSTEG) || 0) - (Number(watchedValues.amount) || 0);
  
  const availableMeters = meters.filter(m => m.status === 'En service');
  
  const formatKWh = (value: number) => new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(value);
  const formatDT = (value: number) => new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND', minimumFractionDigits: 3 }).format(value);
  
  const mthGroup1Total = useMemo(() => {
    return (Number(watchedValues.prime_puissance_mth) || 0) +
           (Number(watchedValues.depassement_puissance) || 0) +
           (Number(watchedValues.location_materiel) || 0) +
           (Number(watchedValues.frais_intervention) || 0) +
           (Number(watchedValues.frais_relance) || 0) +
           (Number(watchedValues.frais_retard) || 0);
  }, [
    watchedValues.prime_puissance_mth, watchedValues.depassement_puissance,
    watchedValues.location_materiel, watchedValues.frais_intervention,
    watchedValues.frais_relance, watchedValues.frais_retard
  ]);

  const mthGroup2Total = useMemo(() => {
    return (Number(watchedValues.tva_consommation) || 0) +
           (Number(watchedValues.tva_redevance) || 0) +
           (Number(watchedValues.contribution_rtt_mth) || 0) +
           (Number(watchedValues.surtaxe_municipale_mth) || 0);
  }, [
    watchedValues.tva_consommation, watchedValues.tva_redevance,
    watchedValues.contribution_rtt_mth, watchedValues.surtaxe_municipale_mth
  ]);

  const isAncienIndexReadOnly = useMemo(() => {
    if (isEditMode) return false;
    if (previousBill) return true;
    if (selectedMeter && selectedMeter.indexDepart !== undefined) {
      // It's the first bill and meter has a starting index
      return true;
    }
    return false;
  }, [isEditMode, previousBill, selectedMeter]);

  return (
    <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-4 md:grid-cols-2">
            {isEditMode ? (
                <FormField control={form.control} name="reference" render={({ field }) => (
                    <FormItem><FormLabel>Id Facture</FormLabel><FormControl><Input {...field} readOnly className="bg-muted" /></FormControl><FormMessage /></FormItem>
                )} />
            ) : (
                <div className="md:col-span-1 space-y-1">
                    <FormLabel>Id Facture (Auto)</FormLabel>
                    <Input readOnly value={selectedMeter?.referenceFacteur && watchedValues.billDate.length === 7 ? `${selectedMeter.referenceFacteur}-${watchedValues.billDate.replace('/', '')}` : "N/A"} className="font-mono bg-muted"/>
                </div>
            )}
            
            <FormField control={form.control} name="meterId" render={({ field }) => (
                <FormItem><FormLabel>N° Compteur</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!!meterIdParam || isEditMode}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Sélectionner un compteur" /></SelectTrigger></FormControl>
                        <SelectContent>{availableMeters.map(meter => (<SelectItem key={meter.id} value={meter.id}>{meter.id} - {meter.referenceFacteur}</SelectItem>))}</SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
            )} />

            {selectedMeter && (
                <FormField control={form.control} name="typeTension" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Type Tension</FormLabel>
                        <FormControl>
                            <Input {...field} readOnly className="bg-muted" />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
            )}

            {watchedValues.typeTension === 'Basse Tension' && (
                <div className="space-y-4 rounded-md border p-4 md:col-span-2">
                    <div className="grid grid-cols-2 gap-4">
                        <FormField control={form.control} name="ancienIndex" render={({ field }) => (
                            <FormItem><FormLabel>Ancien Index</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} readOnly={isAncienIndexReadOnly} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="nouveauIndex" render={({ field }) => (
                            <FormItem><FormLabel>Nouveau Index</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                        )} />
                    </div>
                     <FormField control={form.control} name="prix_unitaire_bt" render={({ field }) => (
                        <FormItem><FormLabel>Prix Unitaire (kWh)</FormLabel><FormControl><Input type="number" step="0.001" {...field} value={field.value ?? ''} readOnly /></FormControl><FormMessage /></FormItem>
                    )} />
                    <Separator />
                    <h4 className="font-medium text-sm">Taxes et Redevances</h4>
                     <div className="grid grid-cols-2 gap-4">
                        <FormField control={form.control} name="redevances_fixes" render={({ field }) => (
                            <FormItem><FormLabel>Redevances Fixes</FormLabel><FormControl><Input type="number" step="0.001" {...field} value={field.value ?? ''} readOnly /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="tva_bt" render={({ field }) => (
                            <FormItem><FormLabel>TVA</FormLabel><FormControl><Input type="number" step="0.001" {...field} value={field.value ?? ''} readOnly /></FormControl><FormMessage /></FormItem>
                        )} />
                         <FormField control={form.control} name="ertt_bt" render={({ field }) => (
                            <FormItem><FormLabel>Contr. ERTT</FormLabel><FormControl><Input type="number" step="0.001" {...field} value={field.value ?? ''} readOnly /></FormControl><FormMessage /></FormItem>
                        )} />
                    </div>
                </div>
            )}

            {watchedValues.typeTension === 'Moyen Tension Tranche Horaire' && (
                <div className="space-y-4 rounded-md border p-4 md:col-span-2">
                    <div className="grid grid-cols-4 gap-4">
                        <FormLabel className="col-span-2">Index</FormLabel>
                        <FormLabel>Coefficient</FormLabel>
                        <FormLabel>P.U.</FormLabel>
                    </div>
                    {/* Jour */}
                    <div className="grid grid-cols-4 gap-4 items-end">
                       <FormField control={form.control} name="ancien_index_jour" render={({ field }) => ( <FormItem><FormLabel className="text-xs">Anc. Idx Jour</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} readOnly={isAncienIndexReadOnly} /></FormControl></FormItem> )} />
                       <FormField control={form.control} name="nouveau_index_jour" render={({ field }) => ( <FormItem><FormLabel className="text-xs">Nouv. Idx Jour</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl></FormItem> )} />
                       <FormField control={form.control} name="coefficient_jour" render={({ field }) => ( <FormItem><FormControl><Input type="number" step="0.1" {...field} value={field.value ?? ''} readOnly /></FormControl></FormItem> )} />
                       <FormField control={form.control} name="prix_unitaire_jour" render={({ field }) => ( <FormItem><FormControl><Input type="number" step="0.001" {...field} value={field.value ?? ''} readOnly /></FormControl></FormItem> )} />
                    </div>
                    {/* Pointe */}
                     <div className="grid grid-cols-4 gap-4 items-end">
                       <FormField control={form.control} name="ancien_index_pointe" render={({ field }) => ( <FormItem><FormLabel className="text-xs">Anc. Idx Pointe</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} readOnly={isAncienIndexReadOnly} /></FormControl></FormItem> )} />
                       <FormField control={form.control} name="nouveau_index_pointe" render={({ field }) => ( <FormItem><FormLabel className="text-xs">Nouv. Idx Pointe</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl></FormItem> )} />
                       <FormField control={form.control} name="coefficient_pointe" render={({ field }) => ( <FormItem><FormControl><Input type="number" step="0.1" {...field} value={field.value ?? ''} readOnly /></FormControl></FormItem> )} />
                       <FormField control={form.control} name="prix_unitaire_pointe" render={({ field }) => ( <FormItem><FormControl><Input type="number" step="0.001" {...field} value={field.value ?? ''} readOnly /></FormControl></FormItem> )} />
                    </div>
                    {/* Soir */}
                     <div className="grid grid-cols-4 gap-4 items-end">
                       <FormField control={form.control} name="ancien_index_soir" render={({ field }) => ( <FormItem><FormLabel className="text-xs">Anc. Idx Soir</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} readOnly={isAncienIndexReadOnly} /></FormControl></FormItem> )} />
                       <FormField control={form.control} name="nouveau_index_soir" render={({ field }) => ( <FormItem><FormLabel className="text-xs">Nouv. Idx Soir</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl></FormItem> )} />
                       <FormField control={form.control} name="coefficient_soir" render={({ field }) => ( <FormItem><FormControl><Input type="number" step="0.1" {...field} value={field.value ?? ''} readOnly /></FormControl></FormItem> )} />
                       <FormField control={form.control} name="prix_unitaire_soir" render={({ field }) => ( <FormItem><FormControl><Input type="number" step="0.001" {...field} value={field.value ?? ''} readOnly /></FormControl></FormItem> )} />
                    </div>
                    {/* Nuit */}
                    <div className="grid grid-cols-4 gap-4 items-end">
                       <FormField control={form.control} name="ancien_index_nuit" render={({ field }) => ( <FormItem><FormLabel className="text-xs">Anc. Idx Nuit</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} readOnly={isAncienIndexReadOnly} /></FormControl></FormItem> )} />
                       <FormField control={form.control} name="nouveau_index_nuit" render={({ field }) => ( <FormItem><FormLabel className="text-xs">Nouv. Idx Nuit</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl></FormItem> )} />
                       <FormField control={form.control} name="coefficient_nuit" render={({ field }) => ( <FormItem><FormControl><Input type="number" step="0.1" {...field} value={field.value ?? ''} readOnly /></FormControl></FormItem> )} />
                       <FormField control={form.control} name="prix_unitaire_nuit" render={({ field }) => ( <FormItem><FormControl><Input type="number" step="0.001" {...field} value={field.value ?? ''} readOnly /></FormControl></FormItem> )} />
                    </div>
                    <Separator />
                     <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                        <FormField control={form.control} name="consommation_jour" render={({ field }) => ( <FormItem className="flex items-center justify-between"><span>Conso. Jour:</span><FormControl><Input className="w-24 h-8 text-right" type="number" {...field} placeholder="Auto" /></FormControl></FormItem> )} />
                        <FormField control={form.control} name="consommation_pointe" render={({ field }) => ( <FormItem className="flex items-center justify-between"><span>Conso. Pointe:</span><FormControl><Input className="w-24 h-8 text-right" type="number" {...field} placeholder="Auto" /></FormControl></FormItem> )} />
                        <FormField control={form.control} name="consommation_soir" render={({ field }) => ( <FormItem className="flex items-center justify-between"><span>Conso. Soir:</span><FormControl><Input className="w-24 h-8 text-right" type="number" {...field} placeholder="Auto" /></FormControl></FormItem> )} />
                        <FormField control={form.control} name="consommation_nuit" render={({ field }) => ( <FormItem className="flex items-center justify-between"><span>Conso. Nuit:</span><FormControl><Input className="w-24 h-8 text-right" type="number" {...field} placeholder="Auto" /></FormControl></FormItem> )} />
                     </div>
                    <Separator />
                     <div className="space-y-4 rounded-md border p-4">
                        <h4 className="font-medium text-sm">Groupe 1: Redevances</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <FormField control={form.control} name="prime_puissance_mth" render={({ field }) => ( <FormItem><FormLabel>Prime Puissance</FormLabel><FormControl><Input type="number" step="0.001" {...field} /></FormControl></FormItem> )} />
                            <FormField control={form.control} name="depassement_puissance" render={({ field }) => ( <FormItem><FormLabel>Dépassement Puissance</FormLabel><FormControl><Input type="number" step="0.001" {...field} /></FormControl></FormItem> )} />
                            <FormField control={form.control} name="location_materiel" render={({ field }) => ( <FormItem><FormLabel>Location Matériel</FormLabel><FormControl><Input type="number" step="0.001" {...field} /></FormControl></FormItem> )} />
                            <FormField control={form.control} name="frais_intervention" render={({ field }) => ( <FormItem><FormLabel>Frais Intervention</FormLabel><FormControl><Input type="number" step="0.001" {...field} /></FormControl></FormItem> )} />
                            <FormField control={form.control} name="frais_relance" render={({ field }) => ( <FormItem><FormLabel>Frais Relance</FormLabel><FormControl><Input type="number" step="0.001" {...field} /></FormControl></FormItem> )} />
                            <FormField control={form.control} name="frais_retard" render={({ field }) => ( <FormItem><FormLabel>Frais Retard</FormLabel><FormControl><Input type="number" step="0.001" {...field} /></FormControl></FormItem> )} />
                        </div>
                        <Separator />
                        <div className="flex justify-between items-center font-semibold">
                            <span>Montant Groupe 1:</span>
                            <span>{formatDT(mthGroup1Total)}</span>
                        </div>
                    </div>
                     <div className="space-y-4 rounded-md border p-4">
                        <h4 className="font-medium text-sm">Groupe 2: Taxes</h4>
                         <div className="grid grid-cols-2 gap-4">
                            <FormField control={form.control} name="tva_consommation" render={({ field }) => ( <FormItem><FormLabel>TVA Consommation</FormLabel><FormControl><Input type="number" step="0.001" {...field} /></FormControl></FormItem> )} />
                            <FormField control={form.control} name="tva_redevance" render={({ field }) => ( <FormItem><FormLabel>TVA Redevance</FormLabel><FormControl><Input type="number" step="0.001" {...field} /></FormControl></FormItem> )} />
                            <FormField control={form.control} name="contribution_rtt_mth" render={({ field }) => ( <FormItem><FormLabel>Contribution RTT</FormLabel><FormControl><Input type="number" step="0.001" {...field} /></FormControl></FormItem> )} />
                            <FormField control={form.control} name="surtaxe_municipale_mth" render={({ field }) => ( <FormItem><FormLabel>Surtaxe Municipale</FormLabel><FormControl><Input type="number" step="0.001" {...field} /></FormControl></FormItem> )} />
                        </div>
                        <Separator />
                        <div className="flex justify-between items-center font-semibold">
                            <span>Montant Groupe 2:</span>
                            <span>{formatDT(mthGroup2Total)}</span>
                        </div>
                    </div>
                </div>
            )}
            
            {watchedValues.typeTension === 'Moyen Tension Forfaitaire' && (
                <div className="md:col-span-2 space-y-4 rounded-md border p-4">
                     <div className="grid grid-cols-2 gap-4">
                        <FormField control={form.control} name="mtf_ancien_index" render={({ field }) => ( <FormItem><FormLabel>Ancien Index</FormLabel><FormControl><Input type="number" {...field} readOnly={isAncienIndexReadOnly} /></FormControl></FormItem> )} />
                        <FormField control={form.control} name="mtf_nouveau_index" render={({ field }) => ( <FormItem><FormLabel>Nouveau Index</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem> )} />
                        <FormField control={form.control} name="coefficient_multiplicateur" render={({ field }) => ( <FormItem><FormLabel>Coeff. Multiplicateur</FormLabel><FormControl><Input type="number" step="0.1" {...field} readOnly /></FormControl></FormItem> )} />
                        <FormField control={form.control} name="perte_en_charge" render={({ field }) => ( <FormItem><FormLabel>Perte en Charge (kWh)</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem> )} />
                        <FormField control={form.control} name="perte_a_vide" render={({ field }) => ( <FormItem><FormLabel>Perte à Vide (kWh)</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem> )} />
                        <FormField control={form.control} name="pu_consommation" render={({ field }) => ( <FormItem><FormLabel>P.U. Consommation</FormLabel><FormControl><Input type="number" step="0.001" {...field} readOnly /></FormControl></FormItem> )} />
                        <FormField control={form.control} name="prime_puissance" render={({ field }) => ( <FormItem><FormLabel>Prime de Puissance</FormLabel><FormControl><Input type="number" step="0.001" {...field} /></FormControl></FormItem> )} />
                        <FormField control={form.control} name="bonification" render={({ field }) => ( <FormItem><FormLabel>Bonification</FormLabel><FormControl><Input type="number" step="0.001" {...field} /></FormControl></FormItem> )} />
                        <FormField control={form.control} name="contribution_rtt" render={({ field }) => ( <FormItem><FormLabel>Contribution RTT</FormLabel><FormControl><Input type="number" step="0.001" {...field} /></FormControl></FormItem> )} />
                        <FormField control={form.control} name="surtaxe_municipale" render={({ field }) => ( <FormItem><FormLabel>Surtaxe Municipale</FormLabel><FormControl><Input type="number" step="0.001" {...field} /></FormControl></FormItem> )} />
                        <FormField control={form.control} name="avance_consommation" render={({ field }) => ( <FormItem><FormLabel>Avance / Consommation</FormLabel><FormControl><Input type="number" step="0.001" {...field} /></FormControl></FormItem> )} />
                     </div>
                     <Separator />
                     <div className="grid grid-cols-2 gap-4">
                        <FormField control={form.control} name="tva_consommation_percent" render={({ field }) => ( <FormItem><FormLabel>TVA Consommation (%)</FormLabel><FormControl><Input type="number" {...field} readOnly /></FormControl></FormItem> )} />
                        <FormField control={form.control} name="tva_redevance_percent" render={({ field }) => ( <FormItem><FormLabel>TVA Redevance (%)</FormLabel><FormControl><Input type="number" {...field} readOnly /></FormControl></FormItem> )} />
                    </div>
                </div>
            )}


            <FormField control={form.control} name="consumptionKWh" render={({ field }) => (
                <FormItem><FormLabel>Consommation (kWh)</FormLabel>
                    <FormControl>
                        <Input type="number" {...field} value={field.value ?? 0} readOnly={isCalculated} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )} />

            <FormField control={form.control} name="amount" render={({ field }) => (
                <FormItem><FormLabel>Montant Calculé (TND)</FormLabel>
                    <FormControl>
                        <Input type="number" step="0.001" {...field} value={field.value ?? 0} readOnly={isCalculated}/>
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )} />

            <FormField control={form.control} name="billDate" render={({ field }) => (
                <FormItem className="md:col-span-2">
                    <FormLabel>Mois Facture (MM/AAAA)</FormLabel>
                    <FormControl>
                        <Input placeholder="ex: 12/2024" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )} />

            <FormField control={form.control} name="nombreMois" render={({ field }) => (
                <FormItem><FormLabel>Nombre de mois</FormLabel><FormControl><Input type="number" placeholder="ex: 1" {...field} /></FormControl><FormMessage /></FormItem>
            )} />


             <FormField
                control={form.control}
                name="convenableSTEG"
                render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm md:col-span-2">
                    <div className="space-y-0.5">
                        <FormLabel>Convenable avec STEG</FormLabel>
                    </div>
                    <FormControl>
                        <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        />
                    </FormControl>
                    </FormItem>
                )}
                />
            
            {!watchedValues.convenableSTEG && (
                <div className="md:col-span-2 space-y-4">
                    <FormField control={form.control} name="montantSTEG" render={({ field }) => (
                        <FormItem><FormLabel>Montant Facture STEG (TND)</FormLabel>
                            <FormControl>
                                <Input type="number" step="0.001" {...field} value={field.value ?? 0}/>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    {typeof watchedValues.montantSTEG === 'number' && typeof watchedValues.amount === 'number' && (
                         <Alert variant={difference === 0 ? "default" : "destructive"}>
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Vérification de Montant</AlertTitle>
                            <AlertDescription>
                                Différence: {difference.toLocaleString('fr-TN', { style: 'currency', currency: 'TND', minimumFractionDigits: 3 })}
                            </AlertDescription>
                        </Alert>
                    )}
                     <FormField control={form.control} name="description" render={({ field }) => (
                        <FormItem><FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Expliquez la raison de la non-conformité..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                </div>
            )}


            </div>
            <div className="flex justify-end gap-2 mt-8">
                <Button type="button" variant="ghost" asChild>
                    <Link href={cancelHref}><X className="mr-2" /> Annuler</Link>
                </Button>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button type="button" disabled={!form.formState.isValid || form.formState.isSubmitting}>
                            {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            <Save className="mr-2" /> Enregistrer
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Confirmation</AlertDialogTitle>
                            <AlertDialogDescription>
                                Êtes-vous sûr de vouloir enregistrer cette facture ?
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction onClick={form.handleSubmit(onSubmit)}>
                                Confirmer
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </form>
    </Form>
  );
}
