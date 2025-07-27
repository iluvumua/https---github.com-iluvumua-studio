
import type { Equipment, Building, Bill, Anomaly, Meter } from './types';

export const equipmentData: Equipment[] = [
  { id: 'EQP-001', name: 'ALU_SO_ERR5_MSI11_7302', type: 'IPMSAN Indoor', location: 'ERR5', status: 'Active', lastUpdate: '2023-10-25', fournisseur: 'Alcatel Lucent', typeChassis: '7302', tension: '48V', adresseSteg: 'Cité Erriadh 5 - Sousse', districtSteg: 'SOUSSE CENTRE', coordX: 10.5921583, coordY: 35.7995278, designation: 'ALU-Erriadh5-Rk_01-Sh_A-7302' },
  { id: 'EQP-002', name: 'NSN_SO_EZZH_MSI11_5625-G400', type: 'IPMSAN Indoor', location: 'EZZH', status: 'Active', lastUpdate: '2023-10-24', fournisseur: 'Siemens', typeChassis: '5625-G400', tension: '48V', adresseSteg: 'Cité Ezzouhour - Sousse', districtSteg: 'SOUSSE CENTRE', coordX: 10.585829, coordY: 35.791822, designation: 'Hix_Ezzouhour_1-1' },
  { id: 'EQP-003', name: 'ALU_SO_HRGL_MSI21_7330', type: 'IPMSAN Indoor', location: 'HRGL', status: 'Active', lastUpdate: '2023-09-15', fournisseur: 'Alcatel Lucent', typeChassis: '7330', tension: '48V', adresseSteg: 'Av Principale Hergla', districtSteg: 'Enfidha', coordX: 10.51041, coordY: 36.028373, designation: 'ALU-Hergla-Sh_A-7330' },
  { id: 'EQP-004', name: 'ALU_SO_KANT_MSN01_MM_Immeuble Zarrouk_7353', type: 'MSAN Outdoor', location: 'KANT', status: 'Maintenance', lastUpdate: '2023-10-26', fournisseur: 'Alcatel Lucent', typeChassis: '7353', tension: '48V', adresseSteg: 'Rte Touristique Kantaoui', districtSteg: 'SOUsse NORD', coordX: 10.589497, coordY: 35.886259, designation: 'ALU_SO_MM_Immeuble Zarrouk _FTTB' },
  { id: 'EQP-005', name: 'HUW_SO_CENN_MSN01_T300', type: 'MSAN Outdoor', location: 'CENN', status: 'Inactive', lastUpdate: '2023-10-22', fournisseur: 'Huawei', typeChassis: 'T300', tension: '48V', adresseSteg: 'Cité Ennour - M\'saken', districtSteg: 'Msaken', coordX: 10.587450, coordY: 35.735262, designation: 'HW_SO_Cite_Ennour1_T300' },
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
    { id: 'BILL-0823-01', reference: '552200', compteur: 't', buildingId: '1', buildingName: 'Complexe Sousse République', month: 'Août 2023', amount: 8911.22, consumptionKWh: 25499, status: 'Payée', typeTension: 'Moyenne Tension' },
    { id: 'BILL-0823-02', reference: '542300', compteur: 'n/a', buildingId: 'BLD-02', buildingName: 'Central Erriadh', month: 'Août 2023', amount: 5252.54, consumptionKWh: 14938, status: 'Payée', typeTension: 'Moyenne Tension' },
    { id: 'BILL-0923-01', reference: '542440', compteur: 'n/a', buildingId: '3', buildingName: 'Central Erriadh 5', month: 'Septembre 2023', amount: 2658.48, consumptionKWh: 7471, status: 'Payée', typeTension: 'Moyenne Tension' },
    { id: 'BILL-0923-02', reference: '545040', compteur: '3741669', buildingId: '3', buildingName: 'Complexe Catacombes', month: 'Septembre 2023', amount: 49847.26, consumptionKWh: 148560, status: 'Payée', typeTension: 'Moyenne Tension' },
    { id: 'BILL-1023-01', reference: '597878951', compteur: '751716', buildingId: 'BLD-01', buildingName: 'Espace TT sahloul', month: 'Octobre 2023', amount: 1280.40, consumptionKWh: 5350, status: 'Impayée', typeTension: 'Basse Tension' },
    { id: 'BILL-1023-02', reference: '587687455', compteur: '58879', buildingId: 'BLD-02', buildingName: 'Central  & Dépôt Ibn Khaldoun', month: 'Octobre 2023', amount: 5100.00, consumptionKWh: 22800, status: 'Impayée', typeTension: 'Moyenne Tension' },
];

export const metersData: Meter[] = [
    { id: '537400', buildingId: '1', buildingName: 'Central Msaken', typeTension: 'Moyenne Tension', status: 'Actif' },
    { id: '542300', buildingId: '12', buildingName: 'Central Erriadh', typeTension: 'Moyenne Tension', status: 'Actif' },
    { id: '542440', buildingId: '13', buildingName: 'Central Erriadh 5', typeTension: 'Moyenne Tension', status: 'Actif' },
    { id: '545040', buildingId: '3', buildingName: 'Complexe Catacombes', typeTension: 'Moyenne Tension', status: 'Actif' },
    { id: '548710', buildingId: '10', buildingName: 'Dépôt Sidi Abdelhamid', typeTension: 'Moyenne Tension', status: 'Actif' },
    { id: '597878951', buildingId: '55', buildingName: 'Espace TT sahloul', typeTension: 'Basse Tension', status: 'Actif' },
    { id: '587687455', buildingId: '10', buildingName: 'Central & Dépôt Ibn Khaldoun', typeTension: 'Moyenne Tension', status: 'Inactif' },
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
