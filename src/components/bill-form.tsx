
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
import { Label } from "./ui/label";

const monthNames = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
];

const monthNameToNumber: { [key: string]: string } = {
  "Janvier": "01", "Février": "02", "Mars": "03", "Avril": "04", "Mai": "05", "Juin": "06",
  "Juillet": "07", "Août": "08", "Septembre": "09", "Octobre": "10", "Novembre": "11", "Décembre": "12"
};

const createBillFormSchema = (bills: Bill[], isEditMode: boolean) => z.object({
  id: z.string().optional(),
  meterId: z.string().min(1, "Le N° de compteur est requis."),
  billDate: z.string().regex(/^(0[1-9]|1[0-2])\/\d{4}$/, "Le format doit être MM/AAAA."),
  nombreMois: z.coerce.number().optional(),
  consumptionKWh: z.coerce.number().optional(),
  amount: z.coerce.number().optional(),
  typeTension: z.enum(["Basse Tension", "Moyen Tension Forfaitaire", "Moyen Tension Tranche Horaire"]),
  conformeSTEG: z.boolean().default(false),
  montantSTEG: z.coerce.number().optional(),
  description: z.string().optional(),
  
  // Basse Tension
  ancienIndex: z.coerce.number().optional(),
  nouveauIndex: z.coerce.number().optional(),
  redevances_fixes: z.coerce.number().optional(),
  tva_percent: z.coerce.number().optional(),
  surtaxe_municipale_bt: z.coerce.number().optional(),
  frais_transition_energetique_bt: z.coerce.number().optional(),
  
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
  avance_sur_consommation_mth: z.coerce.number().optional(),
  cos_phi: z.coerce.number().optional(),
  coefficient_k: z.coerce.number().optional(),

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
  frais_location_mtf: z.coerce.number().optional(),
  frais_intervention_mtf: z.coerce.number().optional(),
  frais_relance_mtf: z.coerce.number().optional(),
  frais_retard_mtf: z.coerce.number().optional(),

}).refine(data => {
    if (data.typeTension === "Moyen Tension Forfaitaire" && data.amount === undefined && !data.pu_consommation) return false;
    return true;
}, {
    message: "Le montant est requis pour le type Forfaitaire.",
    path: ["amount"],
}).refine(data => {
    if (!data.conformeSTEG && data.montantSTEG === undefined) return false;
    return true;
}, {
    message: "Le montant STEG est requis si la facture n'est pas conforme.",
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

  const getMonthNumber = useCallback((monthName: string) => {
    try {
        const parsedDate = parse(monthName, "LLLL yyyy", new Date(), { locale: fr });
        if (!isNaN(parsedDate.getTime())) {
            return parsedDate.getFullYear() * 100 + parsedDate.getMonth();
        }
    } catch(e) {}
    return 0;
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: 'onChange'
  });
  
  const { setValue, getValues, reset, watch: watchForm, formState: { dirtyFields } } = form;

  const watchedFields = watchForm();
  const watchedMeterId = watchedFields.meterId;
  const watchedBillDate = watchedFields.billDate;
  const watchedTypeTension = watchedFields.typeTension;

  const previousBill = useMemo(() => {
    if (!watchedMeterId || !watchedBillDate || watchedBillDate.length < 7) return null;
    
    const [monthStr, yearStr] = watchedBillDate.split('/');
    const currentBillDateNum = parseInt(yearStr) * 100 + (parseInt(monthStr) - 1);

    const meterBills = bills
        .filter(b => b.meterId === watchedMeterId)
        .sort((a, b) => getMonthNumber(b.month) - getMonthNumber(a.month)); // sort descending
    
    const lastBill = meterBills.find(b => getMonthNumber(b.month) < currentBillDateNum);

    return lastBill || null;
  }, [watchedMeterId, watchedBillDate, bills, getMonthNumber]);
  
  const selectedMeter = useMemo(() => meters.find(m => m.id === watchedMeterId), [meters, watchedMeterId]);
  
  const hasAnyBillForMeter = useMemo(() => {
    return bills.some(b => b.meterId === watchedMeterId);
  }, [bills, watchedMeterId]);

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
        } catch(e) {}
    } else if (monthParam && yearParam) {
        const monthNumber = monthNameToNumber[monthParam];
        if (monthNumber) {
            billDate = `${monthNumber}/${yearParam}`;
        }
    } else {
        const now = new Date();
        const month = getMonth(now);
        const year = getYear(now);
        billDate = `${(month === 0 ? 12 : month).toString().padStart(2, '0')}/${month === 0 ? year -1 : year}`;
    }
    const initialMeterId = bill?.meterId ?? meterIdParam ?? "";
    const selectedMeterForDefaults = meters.find(m => m.id === initialMeterId);

     return {
        id: bill?.id ?? "",
        meterId: initialMeterId,
        billDate,
        nombreMois: bill?.nombreMois ?? 1,
        typeTension: bill?.typeTension ?? selectedMeterForDefaults?.typeTension ?? "Basse Tension",
        conformeSTEG: bill?.conformeSTEG ?? true,
        consumptionKWh: bill?.consumptionKWh ?? 0,
        amount: bill?.amount ?? 0,
        montantSTEG: bill?.montantSTEG ?? 0,
        description: bill?.description ?? "",
        // BT
        ancienIndex: bill?.ancienIndex ?? 0,
        nouveauIndex: bill?.nouveauIndex ?? 0,
        redevances_fixes: bill?.redevances_fixes ?? settings.basseTension.redevances_fixes,
        tva_percent: bill?.tva_percent ?? settings.basseTension.tva_bt_percent,
        surtaxe_municipale_bt: bill?.surtaxe_municipale_bt ?? settings.basseTension.surtaxe_municipale,
        frais_transition_energetique_bt: bill?.frais_transition_energetique_bt ?? settings.basseTension.frais_transition_energetique,
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
        avance_sur_consommation_mth: bill?.avance_sur_consommation_mth ?? 0,
        consommation_jour: bill?.consommation_jour ?? 0,
        consommation_pointe: bill?.consommation_pointe ?? 0,
        consommation_soir: bill?.consommation_soir ?? 0,
        consommation_nuit: bill?.consommation_nuit ?? 0,
        cos_phi: bill?.cos_phi ?? 0.8,
        coefficient_k: bill?.coefficient_k ?? 0,
        // MT Forfait
        mtf_ancien_index: bill?.mtf_ancien_index ?? 0,
        mtf_nouveau_index: bill?.mtf_nouveau_index ?? 0,
        coefficient_multiplicateur: bill?.coefficient_multiplicateur ?? settings.moyenTensionForfait.coefficient_multiplicateur,
        pu_consommation: bill?.pu_consommation ?? settings.moyenTensionForfait.pu_consommation,
        tva_consommation_percent: bill?.tva_consommation_percent ?? settings.moyenTensionForfait.tva_consommation_percent,
        tva_redevance_percent: bill?.tva_redevance_percent ?? settings.moyenTensionForfait.tva_redevance_percent,
        perte_en_charge: bill?.perte_en_charge ?? 0,
        perte_a_vide: bill?.perte_a_vide ?? 0,
        prime_puissance: bill?.prime_puissance ?? 0,
        contribution_rtt: bill?.contribution_rtt ?? 0,
        surtaxe_municipale: bill?.surtaxe_municipale ?? 0,
        avance_consommation: bill?.avance_consommation ?? 0,
        bonification: bill?.bonification ?? 0,
        frais_location_mtf: bill?.frais_location_mtf ?? 0,
        frais_intervention_mtf: bill?.frais_intervention_mtf ?? 0,
        frais_relance_mtf: bill?.frais_relance_mtf ?? 0,
        frais_retard_mtf: bill?.frais_retard_mtf ?? 0,
     }
  }, [isEditMode, bill, meterIdParam, monthParam, yearParam, meters, settings]);

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);
  
  useEffect(() => {
    if (selectedMeter && watchedBillDate && watchedBillDate.length === 7) {
        const [monthStr, year] = watchedBillDate.split('/');
        if(!monthStr || !year) return;
        const monthIndex = parseInt(monthStr, 10) - 1;
        const monthAbbreviation = monthNames[monthIndex] ? monthNames[monthIndex].substring(0, 3).toUpperCase() : 'UNK';
        const id = `${selectedMeter.referenceFacteur || 'NoRef'}-${monthAbbreviation}${year}`;
        setValue('id', id);
    }
  }, [selectedMeter, watchedBillDate, setValue])

  useEffect(() => {
    if (selectedMeter) {
        if (!dirtyFields.typeTension) {
            setValue('typeTension', selectedMeter.typeTension);
        }
    }
  }, [selectedMeter, setValue, dirtyFields.typeTension]);

  useEffect(() => {
    if (isEditMode) return;
    
    if (previousBill) {
        const type = previousBill.typeTension;
        if (type === 'Basse Tension') setValue('ancienIndex', previousBill.nouveauIndex ?? previousBill.ancienIndex ?? 0);
        if (type === 'Moyen Tension Forfaitaire') setValue('mtf_ancien_index', previousBill.mtf_nouveau_index ?? previousBill.mtf_ancien_index ?? 0);
        if (type === 'Moyen Tension Tranche Horaire') {
            setValue('ancien_index_jour', previousBill.nouveau_index_jour ?? previousBill.ancien_index_jour ?? 0);
            setValue('ancien_index_pointe', previousBill.nouveau_index_pointe ?? previousBill.ancien_index_pointe ?? 0);
            setValue('ancien_index_soir', previousBill.nouveau_index_soir ?? previousBill.ancien_index_soir ?? 0);
            setValue('ancien_index_nuit', previousBill.nouveau_index_nuit ?? previousBill.ancien_index_nuit ?? 0);
        }
    } else if (selectedMeter && !hasAnyBillForMeter) {
        // This is the first ever bill for this meter
        const type = selectedMeter.typeTension;
        if (type === 'Basse Tension') setValue('ancienIndex', selectedMeter.indexDepart ?? 0);
        if (type === 'Moyen Tension Forfaitaire') setValue('mtf_ancien_index', selectedMeter.indexDepart ?? 0);
        if (type === 'Moyen Tension Tranche Horaire') {
            setValue('ancien_index_jour', selectedMeter.indexDepartJour ?? 0);
            setValue('ancien_index_pointe', selectedMeter.indexDepartPointe ?? 0);
            setValue('ancien_index_soir', selectedMeter.indexDepartSoir ?? 0);
            setValue('ancien_index_nuit', selectedMeter.indexDepartNuit ?? 0);
        }
    }
  }, [previousBill, selectedMeter, setValue, isEditMode, hasAnyBillForMeter]);


  const { amount, consumptionKWh } = useMemo(() => {
        let consumption = 0;
        let finalAmount = 0;

        const { basseTension: btSettings } = settings;

        if (watchedTypeTension === "Basse Tension") {
            const numAncienIndex = Number(watchedFields.ancienIndex) || 0;
            const numNouveauIndex = Number(watchedFields.nouveauIndex) || 0;
            consumption = calculateConsumptionWithRollover(numAncienIndex, numNouveauIndex);
            
            const nombreMois = Number(watchedFields.nombreMois) || 1;
            const conso_mensuelle = consumption / nombreMois;

            let montant_tranche1 = 0, montant_tranche2 = 0, montant_tranche3 = 0, montant_tranche4 = 0;

            if (conso_mensuelle > 0) {
                const t1 = Math.min(conso_mensuelle, 200);
                montant_tranche1 = t1 * (btSettings.tranche1);
            }
            if (conso_mensuelle > 200) {
                const t2 = Math.min(conso_mensuelle - 200, 100);
                montant_tranche2 = t2 * (btSettings.tranche2);
            }
            if (conso_mensuelle > 300) {
                const t3 = Math.min(conso_mensuelle - 300, 200);
                montant_tranche3 = t3 * (btSettings.tranche3);
            }
            if (conso_mensuelle > 500) {
                const t4 = conso_mensuelle - 500;
                montant_tranche4 = t4 * (btSettings.tranche4);
            }

            const total_tranches = (montant_tranche1 + montant_tranche2 + montant_tranche3 + montant_tranche4) * nombreMois;
            const montant_surtaxe = consumption * (Number(watchedFields.surtaxe_municipale_bt) || 0);
            const montant_frais_transition = consumption * (Number(watchedFields.frais_transition_energetique_bt) || 0);
            
            const sous_total = total_tranches + (Number(watchedFields.redevances_fixes) || 0) + montant_surtaxe + montant_frais_transition;
            const montant_tva = sous_total * ((Number(watchedFields.tva_percent) || 0) / 100);
            
            finalAmount = sous_total + montant_tva;

        } else if (watchedTypeTension === "Moyen Tension Tranche Horaire") {
            const consoJour = calculateConsumptionWithRollover(watchedFields.ancien_index_jour, watchedFields.nouveau_index_jour);
            const consoPointe = calculateConsumptionWithRollover(watchedFields.ancien_index_pointe, watchedFields.nouveau_index_pointe);
            const consoSoir = calculateConsumptionWithRollover(watchedFields.ancien_index_soir, watchedFields.nouveau_index_soir);
            const consoNuit = calculateConsumptionWithRollover(watchedFields.ancien_index_nuit, watchedFields.nouveau_index_nuit);

            const totalConsumption = (consoJour * (Number(watchedFields.coefficient_jour) || 1)) +
                                     (consoPointe * (Number(watchedFields.coefficient_pointe) || 1)) +
                                     (consoSoir * (Number(watchedFields.coefficient_soir) || 1)) +
                                     (consoNuit * (Number(watchedFields.coefficient_nuit) || 1));
            consumption = totalConsumption;
            
            const montantJour = (consoJour * (Number(watchedFields.coefficient_jour) || 1)) * (Number(watchedFields.prix_unitaire_jour) || 0);
            const montantPointe = (consoPointe * (Number(watchedFields.coefficient_pointe) || 1)) * (Number(watchedFields.prix_unitaire_pointe) || 0);
            const montantSoir = (consoSoir * (Number(watchedFields.coefficient_soir) || 1)) * (Number(watchedFields.prix_unitaire_soir) || 0);
            const montantNuit = (consoNuit * (Number(watchedFields.coefficient_nuit) || 1)) * (Number(watchedFields.prix_unitaire_nuit) || 0);

            const subtotal = montantJour + montantPointe + montantSoir + montantNuit;
            
            const group1Total = (Number(watchedFields.prime_puissance_mth) || 0) + (Number(watchedFields.depassement_puissance) || 0) + (Number(watchedFields.location_materiel) || 0) + (Number(watchedFields.frais_intervention) || 0) + (Number(watchedFields.frais_relance) || 0) + (Number(watchedFields.frais_retard) || 0);
            
            const bonification_calc = (Number(watchedFields.cos_phi) > 0.8) 
                ? -1 * (Number(watchedFields.coefficient_k) || 0) * subtotal
                : (Number(watchedFields.coefficient_k) || 0) * subtotal;

            const group2Total = (Number(watchedFields.tva_consommation) || 0) + (Number(watchedFields.tva_redevance) || 0) + (Number(watchedFields.contribution_rtt_mth) || 0) + (Number(watchedFields.surtaxe_municipale_mth) || 0);
            
            finalAmount = subtotal + group1Total + bonification_calc + group2Total + (Number(watchedFields.avance_sur_consommation_mth) || 0);

        } else if (watchedTypeTension === "Moyen Tension Forfaitaire") {
            const indexDifference = calculateConsumptionWithRollover(watchedFields.mtf_ancien_index, watchedFields.mtf_nouveau_index);
            const perteEnCharge = Number(watchedFields.perte_en_charge) || 0;

            const energie_enregistree = indexDifference * (Number(watchedFields.coefficient_multiplicateur) || 0);
            const consommation_a_facturer = energie_enregistree + perteEnCharge + (Number(watchedFields.perte_a_vide) || 0);
            consumption = consommation_a_facturer;

            const montant_consommation = consommation_a_facturer * (Number(watchedFields.pu_consommation) || 0);
            const sous_total_consommation = montant_consommation;

            const bonification_calc = (Number(watchedFields.cos_phi) > 0.8)
                ? -1 * (Number(watchedFields.coefficient_k) || 0) * montant_consommation
                : (Number(watchedFields.coefficient_k) || 0) * montant_consommation;
            
            const totalFraisDivers = (Number(watchedFields.prime_puissance) || 0) + (Number(watchedFields.frais_location_mtf) || 0) + (Number(watchedFields.frais_intervention_mtf) || 0) + (Number(watchedFields.frais_relance_mtf) || 0) + (Number(watchedFields.frais_retard_mtf) || 0);
            const total_1 = sous_total_consommation + bonification_calc;
            const total_2 = total_1 + totalFraisDivers;
            const tva_consommation = total_1 * ((Number(watchedFields.tva_consommation_percent) || 0) / 100);
            const tva_redevance = totalFraisDivers * ((Number(watchedFields.tva_redevance_percent) || 0) / 100);
            const total_3 = total_2 + tva_consommation + tva_redevance + (Number(watchedFields.contribution_rtt) || 0) + (Number(watchedFields.surtaxe_municipale) || 0);
            finalAmount = total_3 + (Number(watchedFields.avance_consommation) || 0);
        }

        return { amount: parseFloat(finalAmount.toFixed(3)), consumptionKWh: consumption };
  }, [watchedFields, watchedTypeTension, settings]);

  const perteEnCharge = useMemo(() => {
    if (watchedTypeTension !== 'Moyen Tension Forfaitaire') return 0;
    const indexDifference = calculateConsumptionWithRollover(watchedFields.mtf_ancien_index, watchedFields.mtf_nouveau_index);
    return Math.round(indexDifference * 0.02);
  }, [watchedTypeTension, watchedFields.mtf_ancien_index, watchedFields.mtf_nouveau_index]);

 useEffect(() => {
    if (watchedTypeTension === 'Moyen Tension Forfaitaire') {
        if(perteEnCharge !== getValues('perte_en_charge')) {
            setValue('perte_en_charge', perteEnCharge, { shouldValidate: true });
        }
    }
  }, [perteEnCharge, watchedTypeTension, setValue, getValues]);


  useEffect(() => {
    if (!dirtyFields.consumptionKWh) {
      setValue('consumptionKWh', consumptionKWh);
    }
  }, [consumptionKWh, setValue, dirtyFields.consumptionKWh]);

  useEffect(() => {
    if (!dirtyFields.amount) {
      setValue('amount', amount);
    }
  }, [amount, setValue, dirtyFields.amount]);


  const onSubmit = (values: FormValues) => {
    const [month, year] = values.billDate.split('/');
    const monthIndex = parseInt(month, 10) - 1;
    const monthName = monthNames[monthIndex] || 'Unknown';
    const formattedMonth = `${monthName} ${year}`;
    
    const billData: Bill = {
        id: values.id || `BILL-${Date.now()}`,
        meterId: values.meterId,
        month: formattedMonth,
        nombreMois: values.nombreMois,
        typeTension: values.typeTension,
        consumptionKWh: values.consumptionKWh ?? 0,
        amount: values.amount ?? 0,
        conformeSTEG: values.conformeSTEG,
        montantSTEG: values.montantSTEG,
        description: values.description,
        
        // BT
        ancienIndex: values.typeTension === "Basse Tension" ? values.ancienIndex : undefined,
        nouveauIndex: values.typeTension === "Basse Tension" ? values.nouveauIndex : undefined,
        redevances_fixes: values.typeTension === "Basse Tension" ? values.redevances_fixes : undefined,
        tva_percent: values.typeTension === "Basse Tension" ? values.tva_percent : undefined,
        surtaxe_municipale_bt: values.typeTension === "Basse Tension" ? values.surtaxe_municipale_bt : undefined,
        frais_transition_energetique_bt: values.typeTension === "Basse Tension" ? values.frais_transition_energetique_bt : undefined,
        
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
        avance_sur_consommation_mth: values.typeTension === "Moyen Tension Tranche Horaire" ? values.avance_sur_consommation_mth : undefined,
        cos_phi: values.typeTension === "Moyen Tension Tranche Horaire" || values.typeTension === 'Moyen Tension Forfaitaire' ? values.cos_phi : undefined,
        coefficient_k: values.typeTension === "Moyen Tension Tranche Horaire" || values.typeTension === 'Moyen Tension Forfaitaire' ? values.coefficient_k : undefined,


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
        frais_location_mtf: values.typeTension === "Moyen Tension Forfaitaire" ? values.frais_location_mtf : undefined,
        frais_intervention_mtf: values.typeTension === "Moyen Tension Forfaitaire" ? values.frais_intervention_mtf : undefined,
        frais_relance_mtf: values.typeTension === "Moyen Tension Forfaitaire" ? values.frais_relance_mtf : undefined,
        frais_retard_mtf: values.typeTension === "Moyen Tension Forfaitaire" ? values.frais_retard_mtf : undefined,
    };

    if (isEditMode) {
        updateBill(billData);
        toast({ title: "Facture modifiée", description: "La facture a été mise à jour avec succès." });
    } else {
        addBill(billData);
        toast({ title: "Facture ajoutée", description: "La nouvelle facture a été enregistrée avec succès." });
    }
    router.push(`/dashboard/billing/${values.meterId}`);
  }
  
  const isCalculated = watchedTypeTension === 'Basse Tension' || watchedTypeTension === 'Moyen Tension Tranche Horaire' || watchedTypeTension === 'Moyen Tension Forfaitaire';
  const cancelHref = bill ? `/dashboard/billing/${bill.meterId}` : '/dashboard/billing';
  
  const difference = (Number(watchForm("montantSTEG")) || 0) - (Number(watchForm("amount")) || 0);
  
  const availableMeters = meters.filter(m => m.status === 'En service');
  
  const formatKWh = (value: number) => new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(value);
  const formatDT = (value: number) => new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND', minimumFractionDigits: 3 }).format(value);
  
  const mthGroup1Total = useMemo(() => {
    const values = getValues();
    return (Number(values.prime_puissance_mth) || 0) +
           (Number(values.depassement_puissance) || 0) +
           (Number(values.location_materiel) || 0) +
           (Number(values.frais_intervention) || 0) +
           (Number(values.frais_relance) || 0) +
           (Number(values.frais_retard) || 0);
  }, [getValues, watchedFields]);

  const mthGroup2Total = useMemo(() => {
    const values = getValues();
    return (Number(values.tva_consommation) || 0) +
           (Number(values.tva_redevance) || 0) +
           (Number(values.contribution_rtt_mth) || 0) +
           (Number(values.surtaxe_municipale_mth) || 0);
  }, [getValues, watchedFields]);

  return (
    <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid gap-6 py-4 max-h-[60vh] overflow-y-auto pr-4 md:grid-cols-1">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div>
                    <Label htmlFor="id">ID Facture</Label>
                    <Input id="id" readOnly value={watchedFields.id || ''} className="bg-muted" />
                 </div>
                <FormField control={form.control} name="meterId" render={({ field }) => (
                    <FormItem><FormLabel>N° Compteur (Réf: {selectedMeter?.referenceFacteur || 'N/A'})</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!!meterIdParam || isEditMode}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Sélectionner un compteur" /></SelectTrigger></FormControl>
                            <SelectContent>{availableMeters.map(meter => (<SelectItem key={meter.id} value={meter.id}>{meter.id} - {meter.referenceFacteur}</SelectItem>))}</SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )} />
            </div>
            
            
            {selectedMeter && (
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField control={form.control} name="typeTension" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Type Tension</FormLabel>
                            <FormControl>
                                <Input {...field} value={field.value ?? ''} readOnly className="bg-muted" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                </div>
            )}

            {watchedTypeTension === 'Basse Tension' && (
                <div className="space-y-4 rounded-md border p-4">
                     <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <FormField control={form.control} name="ancienIndex" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Ancien Index (Départ: {selectedMeter?.indexDepart ?? 'N/A'})</FormLabel>
                                <FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl><FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="nouveauIndex" render={({ field }) => (
                            <FormItem><FormLabel>Nouveau Index</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                        )} />
                    </div>
                     <Separator />
                    <Label>Redevances et Taxes</Label>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <FormField control={form.control} name="redevances_fixes" render={({ field }) => ( <FormItem><FormLabel className="text-xs">Redevances Fixes</FormLabel><FormControl><Input type="number" step="0.001" {...field} value={field.value ?? ''} /></FormControl></FormItem> )} />
                        <FormField control={form.control} name="tva_percent" render={({ field }) => ( <FormItem><FormLabel className="text-xs">TVA (%)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl></FormItem> )} />
                        <FormField control={form.control} name="surtaxe_municipale_bt" render={({ field }) => ( <FormItem><FormLabel className="text-xs">Surtaxe Municipale</FormLabel><FormControl><Input type="number" step="0.001" {...field} value={field.value ?? ''} /></FormControl></FormItem> )} />
                        <FormField control={form.control} name="frais_transition_energetique_bt" render={({ field }) => ( <FormItem><FormLabel className="text-xs">Contr. RTT</FormLabel><FormControl><Input type="number" step="0.001" {...field} value={field.value ?? ''} /></FormControl></FormItem> )} />
                    </div>
                </div>
            )}

            {watchedTypeTension === 'Moyen Tension Tranche Horaire' && (
                <div className="space-y-4 rounded-md border p-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <FormLabel className="col-span-1 sm:col-span-2">Index</FormLabel>
                        <FormLabel className="hidden sm:block">Coefficient</FormLabel>
                        <FormLabel className="hidden sm:block">P.U.</FormLabel>
                    </div>
                    {/* Jour */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 items-end">
                       <FormField control={form.control} name="ancien_index_jour" render={({ field }) => ( <FormItem><FormLabel className="text-xs">Anc. Idx Jour (Départ: {selectedMeter?.indexDepartJour ?? 'N/A'})</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl></FormItem> )} />
                       <FormField control={form.control} name="nouveau_index_jour" render={({ field }) => ( <FormItem><FormLabel className="text-xs">Nouv. Idx Jour</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl></FormItem> )} />
                       <FormField control={form.control} name="coefficient_jour" render={({ field }) => ( <FormItem><FormLabel className="text-xs sm:hidden">Coeff. Jour</FormLabel><FormControl><Input type="number" step="0.1" {...field} value={field.value ?? ''} /></FormControl></FormItem> )} />
                       <FormField control={form.control} name="prix_unitaire_jour" render={({ field }) => ( <FormItem><FormLabel className="text-xs sm:hidden">P.U. Jour</FormLabel><FormControl><Input type="number" step="0.001" {...field} value={field.value ?? ''} /></FormControl></FormItem> )} />
                    </div>
                    {/* Pointe */}
                     <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 items-end">
                       <FormField control={form.control} name="ancien_index_pointe" render={({ field }) => ( <FormItem><FormLabel className="text-xs">Anc. Idx Pointe (Départ: {selectedMeter?.indexDepartPointe ?? 'N/A'})</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl></FormItem> )} />
                       <FormField control={form.control} name="nouveau_index_pointe" render={({ field }) => ( <FormItem><FormLabel className="text-xs">Nouv. Idx Pointe</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl></FormItem> )} />
                       <FormField control={form.control} name="coefficient_pointe" render={({ field }) => ( <FormItem><FormLabel className="text-xs sm:hidden">Coeff. Pointe</FormLabel><FormControl><Input type="number" step="0.1" {...field} value={field.value ?? ''} /></FormControl></FormItem> )} />
                       <FormField control={form.control} name="prix_unitaire_pointe" render={({ field }) => ( <FormItem><FormLabel className="text-xs sm:hidden">P.U. Pointe</FormLabel><FormControl><Input type="number" step="0.001" {...field} value={field.value ?? ''} /></FormControl></FormItem> )} />
                    </div>
                    {/* Soir */}
                     <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 items-end">
                       <FormField control={form.control} name="ancien_index_soir" render={({ field }) => ( <FormItem><FormLabel className="text-xs">Anc. Idx Soir (Départ: {selectedMeter?.indexDepartSoir ?? 'N/A'})</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl></FormItem> )} />
                       <FormField control={form.control} name="nouveau_index_soir" render={({ field }) => ( <FormItem><FormLabel className="text-xs">Nouv. Idx Soir</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl></FormItem> )} />
                       <FormField control={form.control} name="coefficient_soir" render={({ field }) => ( <FormItem><FormLabel className="text-xs sm:hidden">Coeff. Soir</FormLabel><FormControl><Input type="number" step="0.1" {...field} value={field.value ?? ''} /></FormControl></FormItem> )} />
                       <FormField control={form.control} name="prix_unitaire_soir" render={({ field }) => ( <FormItem><FormLabel className="text-xs sm:hidden">P.U. Soir</FormLabel><FormControl><Input type="number" step="0.001" {...field} value={field.value ?? ''} /></FormControl></FormItem> )} />
                    </div>
                    {/* Nuit */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 items-end">
                       <FormField control={form.control} name="ancien_index_nuit" render={({ field }) => ( <FormItem><FormLabel className="text-xs">Anc. Idx Nuit (Départ: {selectedMeter?.indexDepartNuit ?? 'N/A'})</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl></FormItem> )} />
                       <FormField control={form.control} name="nouveau_index_nuit" render={({ field }) => ( <FormItem><FormLabel className="text-xs">Nouv. Idx Nuit</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl></FormItem> )} />
                       <FormField control={form.control} name="coefficient_nuit" render={({ field }) => ( <FormItem><FormLabel className="text-xs sm:hidden">Coeff. Nuit</FormLabel><FormControl><Input type="number" step="0.1" {...field} value={field.value ?? ''} /></FormControl></FormItem> )} />
                       <FormField control={form.control} name="prix_unitaire_nuit" render={({ field }) => ( <FormItem><FormLabel className="text-xs sm:hidden">P.U. Nuit</FormLabel><FormControl><Input type="number" step="0.001" {...field} value={field.value ?? ''} /></FormControl></FormItem> )} />
                    </div>
                    <Separator />
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm">
                        <FormField control={form.control} name="consommation_jour" render={({ field }) => ( <FormItem className="flex items-center justify-between"><span>Conso. Jour:</span><FormControl><Input className="w-24 h-8 text-right" type="number" {...field} placeholder="Auto" value={field.value ?? ''} /></FormControl></FormItem> )} />
                        <FormField control={form.control} name="consommation_pointe" render={({ field }) => ( <FormItem className="flex items-center justify-between"><span>Conso. Pointe:</span><FormControl><Input className="w-24 h-8 text-right" type="number" {...field} placeholder="Auto" value={field.value ?? ''} /></FormControl></FormItem> )} />
                        <FormField control={form.control} name="consommation_soir" render={({ field }) => ( <FormItem className="flex items-center justify-between"><span>Conso. Soir:</span><FormControl><Input className="w-24 h-8 text-right" type="number" {...field} placeholder="Auto" value={field.value ?? ''} /></FormControl></FormItem> )} />
                        <FormField control={form.control} name="consommation_nuit" render={({ field }) => ( <FormItem className="flex items-center justify-between"><span>Conso. Nuit:</span><FormControl><Input className="w-24 h-8 text-right" type="number" {...field} placeholder="Auto" value={field.value ?? ''} /></FormControl></FormItem> )} />
                     </div>
                    <Separator />
                     <div className="space-y-4 rounded-md border p-4">
                        <h4 className="font-medium text-sm">Groupe 1: Redevances et Frais Divers</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField control={form.control} name="prime_puissance_mth" render={({ field }) => ( <FormItem><FormLabel>Prime Puissance</FormLabel><FormControl><Input type="number" step="0.001" {...field} value={field.value ?? ''} /></FormControl></FormItem> )} />
                            <FormField control={form.control} name="depassement_puissance" render={({ field }) => ( <FormItem><FormLabel>Dépassement Puissance</FormLabel><FormControl><Input type="number" step="0.001" {...field} value={field.value ?? ''} /></FormControl></FormItem> )} />
                            <FormField control={form.control} name="location_materiel" render={({ field }) => ( <FormItem><FormLabel>Frais Location Matériel</FormLabel><FormControl><Input type="number" step="0.001" {...field} value={field.value ?? ''} /></FormControl></FormItem> )} />
                            <FormField control={form.control} name="frais_intervention" render={({ field }) => ( <FormItem><FormLabel>Frais Intervention</FormLabel><FormControl><Input type="number" step="0.001" {...field} value={field.value ?? ''} /></FormControl></FormItem> )} />
                            <FormField control={form.control} name="frais_relance" render={({ field }) => ( <FormItem><FormLabel>Frais Relance</FormLabel><FormControl><Input type="number" step="0.001" {...field} value={field.value ?? ''} /></FormControl></FormItem> )} />
                            <FormField control={form.control} name="frais_retard" render={({ field }) => ( <FormItem><FormLabel>Frais Retard</FormLabel><FormControl><Input type="number" step="0.001" {...field} value={field.value ?? ''} /></FormControl></FormItem> )} />
                        </div>
                        <Separator />
                        <div className="flex justify-between items-center font-semibold">
                            <span>Montant Groupe 1:</span>
                            <span>{formatDT(mthGroup1Total)}</span>
                        </div>
                    </div>
                     <div className="space-y-4 rounded-md border p-4">
                        <h4 className="font-medium text-sm">Bonification/Pénalité</h4>
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           <FormField control={form.control} name="cos_phi" render={({ field }) => ( <FormItem><FormLabel>Cos φ</FormLabel><FormControl><Input type="number" step="0.01" {...field} value={field.value ?? ''} /></FormControl></FormItem> )} />
                           <FormField control={form.control} name="coefficient_k" render={({ field }) => ( <FormItem><FormLabel>Coefficient K</FormLabel><FormControl><Input type="number" step="0.001" {...field} value={field.value ?? ''} /></FormControl></FormItem> )} />
                        </div>
                    </div>
                     <div className="space-y-4 rounded-md border p-4">
                        <h4 className="font-medium text-sm">Groupe 2: Taxes</h4>
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField control={form.control} name="tva_consommation" render={({ field }) => ( <FormItem><FormLabel>TVA Consommation</FormLabel><FormControl><Input type="number" step="0.001" {...field} value={field.value ?? ''} /></FormControl></FormItem> )} />
                            <FormField control={form.control} name="tva_redevance" render={({ field }) => ( <FormItem><FormLabel>TVA Redevance</FormLabel><FormControl><Input type="number" step="0.001" {...field} value={field.value ?? ''} /></FormControl></FormItem> )} />
                            <FormField control={form.control} name="contribution_rtt_mth" render={({ field }) => ( <FormItem><FormLabel>Contribution RTT</FormLabel><FormControl><Input type="number" step="0.001" {...field} value={field.value ?? ''} /></FormControl></FormItem> )} />
                            <FormField control={form.control} name="surtaxe_municipale_mth" render={({ field }) => ( <FormItem><FormLabel>Surtaxe Municipale</FormLabel><FormControl><Input type="number" step="0.001" {...field} value={field.value ?? ''} /></FormControl></FormItem> )} />
                        </div>
                        <Separator />
                        <div className="flex justify-between items-center font-semibold">
                            <span>Montant Groupe 2:</span>
                            <span>{formatDT(mthGroup2Total)}</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField control={form.control} name="avance_sur_consommation_mth" render={({ field }) => ( <FormItem><FormLabel>Avance sur Consommation</FormLabel><FormControl><Input type="number" step="0.001" {...field} value={field.value ?? ''} /></FormControl></FormItem> )} />
                    </div>
                </div>
            )}
            
            {watchedTypeTension === 'Moyen Tension Forfaitaire' && (
                 <div className="space-y-4 rounded-md border p-4">
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField control={form.control} name="mtf_ancien_index" render={({ field }) => ( 
                            <FormItem>
                                <FormLabel>Ancien Index (Départ: {selectedMeter?.indexDepart ?? 'N/A'})</FormLabel>
                                <FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl>
                            </FormItem> 
                        )} />
                        <FormField control={form.control} name="mtf_nouveau_index" render={({ field }) => ( <FormItem><FormLabel>Nouveau Index</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl></FormItem> )} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField control={form.control} name="coefficient_multiplicateur" render={({ field }) => ( <FormItem><FormLabel>Coeff. Multiplicateur</FormLabel><FormControl><Input type="number" step="0.1" {...field} value={field.value ?? ''} /></FormControl></FormItem> )} />
                        
                        <FormField control={form.control} name="perte_a_vide" render={({ field }) => ( <FormItem><FormLabel>Perte à Vide (kWh)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl></FormItem> )} />
                         <FormField control={form.control} name="perte_en_charge" render={({ field }) => ( <FormItem><FormLabel>Perte en Charge (kWh)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} readOnly className="bg-muted" /></FormControl></FormItem> )} />
                        <FormField control={form.control} name="pu_consommation" render={({ field }) => ( <FormItem><FormLabel>P.U. Consommation</FormLabel><FormControl><Input type="number" step="0.001" {...field} value={field.value ?? ''} /></FormControl></FormItem> )} />
                        <FormField control={form.control} name="prime_puissance" render={({ field }) => ( <FormItem><FormLabel>Prime de Puissance</FormLabel><FormControl><Input type="number" step="0.001" {...field} value={field.value ?? ''} /></FormControl></FormItem> )} />
                        <FormField control={form.control} name="cos_phi" render={({ field }) => ( <FormItem><FormLabel>Cos Φ</FormLabel><FormControl><Input type="number" step="0.01" {...field} value={field.value ?? ''} /></FormControl></FormItem> )} />
                        <FormField control={form.control} name="coefficient_k" render={({ field }) => ( <FormItem><FormLabel>Coefficient K</FormLabel><FormControl><Input type="number" step="0.001" {...field} value={field.value ?? ''} /></FormControl></FormItem> )} />
                        <FormField control={form.control} name="contribution_rtt" render={({ field }) => ( <FormItem><FormLabel>Contribution RTT</FormLabel><FormControl><Input type="number" step="0.001" {...field} value={field.value ?? ''} /></FormControl></FormItem> )} />
                        <FormField control={form.control} name="surtaxe_municipale" render={({ field }) => ( <FormItem><FormLabel>Surtaxe Municipale</FormLabel><FormControl><Input type="number" step="0.001" {...field} value={field.value ?? ''} /></FormControl></FormItem> )} />
                        <FormField control={form.control} name="avance_consommation" render={({ field }) => ( <FormItem><FormLabel>Avance / Consommation</FormLabel><FormControl><Input type="number" step="0.001" {...field} value={field.value ?? ''} /></FormControl></FormItem> )} />
                        <FormField control={form.control} name="frais_location_mtf" render={({ field }) => ( <FormItem><FormLabel>Frais Location</FormLabel><FormControl><Input type="number" step="0.001" {...field} value={field.value ?? ''} /></FormControl></FormItem> )} />
                        <FormField control={form.control} name="frais_intervention_mtf" render={({ field }) => ( <FormItem><FormLabel>Frais Intervention</FormLabel><FormControl><Input type="number" step="0.001" {...field} value={field.value ?? ''} /></FormControl></FormItem> )} />
                        <FormField control={form.control} name="frais_relance_mtf" render={({ field }) => ( <FormItem><FormLabel>Frais Relance</FormLabel><FormControl><Input type="number" step="0.001" {...field} value={field.value ?? ''} /></FormControl></FormItem> )} />
                        <FormField control={form.control} name="frais_retard_mtf" render={({ field }) => ( <FormItem><FormLabel>Frais Retard</FormLabel><FormControl><Input type="number" step="0.001" {...field} value={field.value ?? ''} /></FormControl></FormItem> )} />
                     </div>
                     <Separator />
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField control={form.control} name="tva_consommation_percent" render={({ field }) => ( <FormItem><FormLabel>TVA Consommation (%)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl></FormItem> )} />
                        <FormField control={form.control} name="tva_redevance_percent" render={({ field }) => ( <FormItem><FormLabel>TVA Redevance (%)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl></FormItem> )} />
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField control={form.control} name="consumptionKWh" render={({ field }) => (
                    <FormItem><FormLabel>Consommation (kWh)</FormLabel>
                        <FormControl>
                            <Input type="number" {...field} value={field.value ?? ''} readOnly={isCalculated} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )} />

                <FormField control={form.control} name="amount" render={({ field }) => (
                    <FormItem><FormLabel>Montant Calculé (TND)</FormLabel>
                        <FormControl>
                            <Input type="number" step="0.001" {...field} value={field.value ?? ''} readOnly={isCalculated}/>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )} />

                <FormField control={form.control} name="billDate" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Mois Facture (MM/AAAA)</FormLabel>
                        <FormControl>
                            <Input placeholder="ex: 12/2024" {...field} value={field.value ?? ''} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )} />

                <FormField control={form.control} name="nombreMois" render={({ field }) => (
                    <FormItem><FormLabel>Nombre de mois</FormLabel><FormControl><Input type="number" placeholder="ex: 1" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                )} />
            </div>

             <FormField
                control={form.control}
                name="conformeSTEG"
                render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                        <FormLabel>Conforme avec STEG</FormLabel>
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
            
            {!watchForm("conformeSTEG") && (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField control={form.control} name="montantSTEG" render={({ field }) => (
                            <FormItem><FormLabel>Montant Facture STEG (TND)</FormLabel>
                                <FormControl>
                                    <Input type="number" step="0.001" {...field} value={field.value ?? ''}/>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </div>
                    {typeof watchForm("montantSTEG") === 'number' && typeof watchForm("amount") === 'number' && (
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
                                <Textarea placeholder="Expliquez la raison de la non-conformité..." {...field} value={field.value ?? ''} />
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
