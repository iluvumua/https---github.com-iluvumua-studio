export type Equipment = {
  id: string;
  name: string;
  type: string;
  location: string;
  status: 'Active' | 'Inactive' | 'Maintenance';
  lastUpdate: string;
  fournisseur?: string;
  typeChassis?: string;
  designation?: string;
  tension?: string;
  adresseSteg?: string;
  districtSteg?: string;
  coordX?: number;
  coordY?: number;
};

export type Building = {
  id: string;
  code: string; // Code selon Service Bâtiment
  name: string; // NOM DU SITE
  commune: string;
  delegation: string;
  address: string;
  nature: string[]; // Nature can be multiple values (A, T, C, D)
  propriete: 'Propriété TT' | 'Location, ETT' | 'Propriété TT non exploité' | string; // Proriété
  coordX?: number;
  coordY?: number;
};

export type Bill = {
  id: string;
  buildingId: string;
  buildingName: string;
  month: string;
  amount: number;
  consumptionKWh: number;
  status: 'Payée' | 'Impayée';
};

export type Anomaly = {
  id: string;
  timestamp: string;
  building: string;
  description: string;
  severity: 'Low' | 'Medium' | 'High';
}
