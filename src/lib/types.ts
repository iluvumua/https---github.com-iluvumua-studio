export type Equipment = {
  id: string;
  name: string;
  type: string;
  location: string;
  status: 'Active' | 'Inactive' | 'Maintenance';
  lastUpdate: string;
  fournisseur?: string;
};

export type Building = {
  id: string;
  name: string;
  address: string;
  type: 'Owned' | 'Rented';
  energyManager: string;
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

    