

export type Equipment = {
  id: string;
  name: string; // Nom_MSAN
  type: string;
  location: string; // Code  Abréviation
  status: 'En cours' | 'En service' | 'switched off en cours' | 'switched off'; // Etat
  lastUpdate: string;
  fournisseur?: string;
  typeChassis?: string;
  designation?: string; // Nom de l'MSAN (GéoNetwork) ou Nom Workflow
  description?: string;
  coordX?: number;
  coordY?: number;
  compteurId?: string;
  dateMiseEnService?: string;
  dateDemandeResiliation?: string;
  dateResiliationEquipement?: string;
  verifiedBy?: string;
  buildingId?: string;
  associationHistory?: string[];
};

export type Building = {
  id: string;
  code: string; // Code selon Service Bâtiment
  name: string; // NOM DU SITE
  commune: string;
  localisation?: string;
  address: string;
  nature: string[]; // Nature can be multiple values (A, T, C, D)
  propriete: 'Propriété TT' | 'Location, ETT' | 'Propriété TT non exploité' | string; // Proriété
  coordX?: number;
  coordY?: number;
  meterId?: string;
};

export type Bill = {
  id: string; // Auto-generated: referenceFacteur-YYYYMM
  meterId: string; // Numéro du compteur Steg
  month: string;
  amount: number;
  consumptionKWh: number;
  typeTension: 'Basse Tension' | 'Moyen Tension Forfaitaire' | 'Moyen Tension Tranche Horaire';
  conformeSTEG?: boolean;
  montantSTEG?: number;
  nombreMois?: number;
  description?: string;
  
  // Basse tension fields
  ancienIndex?: number;
  nouveauIndex?: number;
  tranche1?: number;
  tranche2?: number;
  tranche3?: number;
  tranche4?: number;
  surtaxe_municipale_bt?: number;
  frais_transition_energetique_bt?: number;
  tva_percent?: number;
  redevances_fixes?: number;

  // Moyen tension horaire fields
  ancien_index_jour?: number;
  nouveau_index_jour?: number;
  ancien_index_pointe?: number;
  nouveau_index_pointe?: number;
  ancien_index_soir?: number;
  nouveau_index_soir?: number;
  ancien_index_nuit?: number;
  nouveau_index_nuit?: number;
  coefficient_jour?: number;
  coefficient_pointe?: number;
  coefficient_soir?: number;
  coefficient_nuit?: number;
  prix_unitaire_jour?: number;
  prix_unitaire_pointe?: number;
  prix_unitaire_soir?: number;
  prix_unitaire_nuit?: number;
  consommation_jour?: number;
  consommation_pointe?: number;
  consommation_soir?: number;
  consommation_nuit?: number;
  frais_divers_mth?: number;
  tva_consommation?: number;
  tva_redevance?: number;
  contribution_rtt_mth?: number;
  surtaxe_municipale_mth?: number;
  avance_sur_consommation_mth?: number;
  cos_phi?: number;
  coefficient_k?: number;

  // Moyen tension forfaitaire fields
  mtf_ancien_index?: number;
  mtf_nouveau_index?: number;
  coefficient_multiplicateur?: number;
  perte_en_charge?: number;
  perte_a_vide?: number;
  pu_consommation?: number;
  prime_puissance?: number;
  tva_consommation_percent?: number;
  tva_redevance_percent?: number;
  contribution_rtt?: number;
  surtaxe_municipale?: number;
  avance_consommation?: number;
  bonification?: number;
  frais_location_mtf?: number;
  frais_intervention_mtf?: number;
  frais_relance_mtf?: number;
  frais_retard_mtf?: number;
};

export type Meter = {
    id: string; // N° Compteur STEG
    policeNumber?: string;
    referenceFacteur?: string; // 9-digit code
    buildingId?: string;
    status: 'En cours' | 'En service' | 'switched off en cours' | 'switched off';
    typeTension: 'Basse Tension' | 'Moyen Tension Forfaitaire' | 'Moyen Tension Tranche Horaire';
    dateDemandeInstallation?: string;
    dateDemandeResiliation?: string;
    dateResiliation?: string;
    dateSubstitution?: string;
    dateMiseEnService?: string;
    description?: string;
    lastUpdate?: string;
    replaces?: string; // ID of the meter this one replaces
    replacedBy?: string; // ID of the meter that replaced this one
    districtSteg?: string;
    phase?: 'Triphasé' | 'Monophasé';
    amperage?: '16A' | '32A' | '63A' | 'Autre';
    amperageAutre?: string;
    indexDepart?: number;
    indexDepartJour?: number;
    indexDepartPointe?: number;
    indexDepartSoir?: number;
    indexDepartNuit?: number;
    associationHistory?: string[];
}
