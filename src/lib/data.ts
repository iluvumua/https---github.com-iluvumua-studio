import type { Equipment, Building, Bill, Anomaly } from './types';

export const equipmentData: Equipment[] = [
  { id: 'EQP-001', name: 'Routeur-A1', type: 'Routeur Réseau', location: 'Bâtiment 1 - Étage 2', status: 'Active', lastUpdate: '2023-10-25', fournisseur: 'Alcatel Lucent', typeChassis: '7302', tension: '48V', adresseSteg: '123 Rue de la Tech', coordX: 10.63, coordY: 35.82 },
  { id: 'EQP-002', name: 'Switch-B1', type: 'Commutateur Réseau', location: 'Bâtiment 1 - Étage 1', status: 'Active', lastUpdate: '2023-10-24', fournisseur: 'Huawei', typeChassis: 'S5700', tension: '48V', adresseSteg: '123 Rue de la Tech', coordX: 10.63, coordY: 35.82 },
  { id: 'EQP-003', name: 'Serveur-C1', type: 'Serveur de Données', location: 'Bâtiment 2 - Centre de Données', status: 'Inactive', lastUpdate: '2023-09-15', fournisseur: 'Siemens', typeChassis: 'RX2530', tension: '220V', adresseSteg: '456 Allée de l\'Innovation', coordX: 10.64, coordY: 35.83 },
  { id: 'EQP-004', name: 'Pare-feu-D1', type: 'Appareil de Sécurité', location: 'Bâtiment 1 - Bureau Principal', status: 'Maintenance', lastUpdate: '2023-10-26', fournisseur: 'Alcatel Lucent', typeChassis: 'ASA 5516', tension: '48V', adresseSteg: '123 Rue de la Tech', coordX: 10.63, coordY: 35.82 },
  { id: 'EQP-005', name: 'PointAccès-E1', type: 'PA Sans Fil', location: 'Bâtiment 2 - Étage 3', status: 'Active', lastUpdate: '2023-10-22', fournisseur: 'Nokia Siemens', typeChassis: 'AP-305', tension: 'PoE', adresseSteg: '456 Allée de l\'Innovation', coordX: 10.64, coordY: 35.83 },
];

export const buildingData: Building[] = [
  { id: 'BLD-01', name: 'Bureau Principal', address: '123 Avenue de la Technologie, Sousse', type: 'Owned', energyManager: 'Ali Ben Salah' },
  { id: 'BLD-02', name: 'Centre de Données', address: '456 Allée de l\'Innovation, Sousse', type: 'Rented', energyManager: 'Fatma Cherif' },
  { id: 'BLD-03', name: 'Entrepôt', address: '789 Parc Industriel, Sousse', type: 'Owned', energyManager: 'Mohamed Ali' },
];

export const billingData: Bill[] = [
    { id: 'BILL-0823-01', buildingId: 'BLD-01', buildingName: 'Bureau Principal', month: 'Août 2023', amount: 1250.75, consumptionKWh: 5200, status: 'Payée' },
    { id: 'BILL-0823-02', buildingId: 'BLD-02', buildingName: 'Centre de Données', month: 'Août 2023', amount: 4800.50, consumptionKWh: 21000, status: 'Payée' },
    { id: 'BILL-0923-01', buildingId: 'BLD-01', buildingName: 'Bureau Principal', month: 'Septembre 2023', amount: 1320.00, consumptionKWh: 5500, status: 'Payée' },
    { id: 'BILL-0923-02', buildingId: 'BLD-02', buildingName: 'Centre de Données', month: 'Septembre 2023', amount: 4750.25, consumptionKWh: 20500, status: 'Payée' },
    { id: 'BILL-1023-01', buildingId: 'BLD-01', buildingName: 'Bureau Principal', month: 'Octobre 2023', amount: 1280.40, consumptionKWh: 5350, status: 'Impayée' },
    { id: 'BILL-1023-02', buildingId: 'BLD-02', buildingName: 'Centre de Données', month: 'Octobre 2023', amount: 5100.00, consumptionKWh: 22800, status: 'Impayée' },
];

export const energyConsumptionData = [
    { month: "May", building1: 5200, building2: 21000 },
    { month: "Jun", building1: 6000, building2: 22500 },
    { month: "Jul", building1: 7500, building2: 24000 },
    { month: "Aug", building1: 5500, building2: 21500 },
    { month: "Sep", building1: 5300, building2: 20500 },
    { month: "Oct", building1: 5400, building2: 22800 },
];

export const recentAnomaliesData: Anomaly[] = [
    { id: 'ANM-001', timestamp: '2023-10-26 03:15', building: 'Centre de Données', description: 'Pic inhabituel de 20% de la consommation pendant la nuit.', severity: 'High' },
    { id: 'ANM-002', timestamp: '2023-10-24 14:00', building: 'Bureau Principal', description: 'La consommation a chuté de 30% pendant les heures de pointe.', severity: 'Medium' },
    { id: 'ANM-003', timestamp: '2023-10-22 09:30', building: 'Entrepôt', description: 'Fluctuation mineure détectée, au-dessus du seuil de 15%.', severity: 'Low' },
];

    