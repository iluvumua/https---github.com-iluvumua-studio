import type { Equipment, Building, Bill, Anomaly } from './types';

export const equipmentData: Equipment[] = [
  { id: 'EQP-001', name: 'Routeur-A1', type: 'Routeur Réseau', location: 'Bâtiment 1 - Étage 2', status: 'Active', lastUpdate: '2023-10-25', fournisseur: 'Alcatel Lucent', typeChassis: '7302', tension: '48V', adresseSteg: '123 Rue de la Tech', districtSteg: 'Sousse Ville', coordX: 10.63, coordY: 35.82 },
  { id: 'EQP-002', name: 'Switch-B1', type: 'Commutateur Réseau', location: 'Bâtiment 1 - Étage 1', status: 'Active', lastUpdate: '2023-10-24', fournisseur: 'Huawei', typeChassis: 'S5700', tension: '48V', adresseSteg: '123 Rue de la Tech', districtSteg: 'Sousse Ville', coordX: 10.63, coordY: 35.82 },
  { id: 'EQP-003', name: 'Serveur-C1', type: 'Serveur de Données', location: 'Bâtiment 2 - Centre de Données', status: 'Inactive', lastUpdate: '2023-09-15', fournisseur: 'Siemens', typeChassis: 'RX2530', tension: '220V', adresseSteg: '456 Allée de l\'Innovation', districtSteg: 'Sahloul', coordX: 10.64, coordY: 35.83 },
  { id: 'EQP-004', name: 'Pare-feu-D1', type: 'Appareil de Sécurité', location: 'Bâtiment 1 - Bureau Principal', status: 'Maintenance', lastUpdate: '2023-10-26', fournisseur: 'Alcatel Lucent', typeChassis: 'ASA 5516', tension: '48V', adresseSteg: '123 Rue de la Tech', districtSteg: 'Sousse Ville', coordX: 10.63, coordY: 35.82 },
  { id: 'EQP-005', name: 'PointAccès-E1', type: 'PA Sans Fil', location: 'Bâtiment 2 - Étage 3', status: 'Active', lastUpdate: '2023-10-22', fournisseur: 'Nokia Siemens', typeChassis: 'AP-305', tension: 'PoE', adresseSteg: '456 Allée de l\'Innovation', districtSteg: 'Sahloul', coordX: 10.64, coordY: 35.83 },
];

export const buildingData: Building[] = [
    { id: '1', code: 'SO01', name: 'Complexe Sousse République', commune: 'Sousse', delegation: 'Sousse Medina', address: 'Av de la République - Sousse 4000', nature: ['T'], propriete: 'Propriété TT', coordX: 10.638617, coordY: 35.829169 },
    { id: '2', code: 'SO30', name: 'Siège DRT Sousse & ETT Sousse', commune: 'Sousse', delegation: 'Sousse Medina', address: 'Rue IBN SINA 4000 - Sousse', nature: ['A', 'T', 'C'], propriete: 'Propriété TT', coordX: 10.6431, coordY: 35.8295 },
    { id: '3', code: 'SO02', name: 'Complexe Catacombes', commune: 'Sousse', delegation: 'Sousse Jawhara', address: 'Rue des Catacombes - Sousse 4061', nature: ['T'], propriete: 'Propriété TT', coordX: 10.627883, coordY: 35.817522 },
    { id: '4', code: 'SO04', name: 'Complexe Sahloul', commune: 'Sousse', delegation: 'Sousse Jawhara', address: 'Rue Yasser ARAFET - Sahloul - Sousse', nature: ['T'], propriete: 'Propriété TT', coordX: 10.596511, coordY: 35.840546 },
    { id: '5', code: 'SO05', name: 'Complexe Khézama', commune: 'Sousse', delegation: 'Sousse Medina', address: 'Rue Colonel GARNAOUI - Khézama - Est - Sousse', nature: ['T'], propriete: 'Propriété TT', coordX: 10.60949167, coordY: 35.85319167 },
    { id: '6', code: 'SO28', name: 'Complexe Cité Hached( ETT BOUHCINA+CFRT+IT°', commune: 'Sousse', delegation: 'Sousse Jawhara', address: 'Cité Hached - 4002 Sousse', nature: ['A', 'T', 'C'], propriete: 'Propriété TT', coordX: 10.6094361, coordY: 35.82395556 },
    { id: '7', code: 'ETT Khezama', name: 'ETT Khezama', commune: 'Sousse', delegation: 'Sousse Jawhara', address: 'Route de Tunis GP1 khezema Croisement Av. le Perle du Sahel et Rue Imam Boukhari', nature: ['C'], propriete: 'Location, ETT', coordX: 10.609715, coordY: 35.847822 },
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
