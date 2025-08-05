
import type { Equipment, Building, Bill, Meter } from './types';

export const equipmentData: Equipment[] = [
  { id: 'EQP-001', name: 'ALU_SO_ERR5_MSI11_7302', type: 'MSI', location: 'ERR5', status: 'Active', lastUpdate: '2023-10-25', fournisseur: 'Alcatel Lucent', typeChassis: '7302', tension: '48V', adresseSteg: 'Cité Erriadh 5 - Sousse', districtSteg: 'SOUSSE CENTRE', coordX: 10.5921583, coordY: 35.7995278, designation: 'ALU-Erriadh5-Rk_01-Sh_A-7302' },
  { id: 'EQP-002', name: 'NSN_SO_EZZH_MSI11_5625-G400', type: 'MSI', location: 'EZZH', status: 'Active', lastUpdate: '2023-10-24', fournisseur: 'Siemens', typeChassis: '5625-G400', tension: '48V', adresseSteg: 'Cité Ezzouhour - Sousse', districtSteg: 'SOUSSE CENTRE', coordX: 10.585829, coordY: 35.791822, designation: 'Hix_Ezzouhour_1-1' },
  { id: 'EQP-003', name: 'ALU_SO_HRGL_MSI21_7330', type: 'MSI', location: 'HRGL', status: 'Active', lastUpdate: '2023-09-15', fournisseur: 'Alcatel Lucent', typeChassis: '7330', tension: '48V', adresseSteg: 'Av Principale Hergla', districtSteg: 'Enfidha', coordX: 10.51041, coordY: 36.028373, designation: 'ALU-Hergla-Sh_A-7330' },
  { id: 'EQP-004', name: 'ALU_SO_KANT_MSN01_MM_Immeuble Zarrouk_7353', type: 'MSN', location: 'KANT', status: 'Maintenance', lastUpdate: '2023-10-26', fournisseur: 'Alcatel Lucent', typeChassis: '7353', tension: '48V', adresseSteg: 'Rte Touristique Kantaoui', districtSteg: 'SOUsse NORD', coordX: 10.589497, coordY: 35.886259, designation: 'ALU_SO_MM_Immeuble Zarrouk _FTTB' },
  { id: 'EQP-005', name: 'HUW_SO_CENN_MSN01_T300', type: 'MSN', location: 'CENN', status: 'Inactive', lastUpdate: '2023-10-22', fournisseur: 'Huawei', typeChassis: 'T300', tension: '48V', adresseSteg: 'Cité Ennour - M\'saken', districtSteg: 'Msaken', coordX: 10.587450, coordY: 35.735262, designation: 'HW_SO_Cite_Ennour1_T300' },
  { id: 'EQP-006', name: 'ALU_SO_REP_MSI01_7330', type: 'MSI', location: 'SO01', status: 'Active', lastUpdate: '2023-11-01', fournisseur: 'Alcatel Lucent', typeChassis: '7330', tension: '48V', adresseSteg: 'Av de la République - Sousse 4000', districtSteg: 'SOUSSE CENTRE', coordX: 10.638617, coordY: 35.829169, designation: 'ALU-Republique-Rk_01-Sh_A-7330' },
];

export const buildingData: Building[] = [
    { id: '1', code: 'SO01', name: 'Complexe Sousse République', commune: 'Sousse', delegation: 'Sousse Medina', address: 'Av de la République - Sousse 4000', nature: ['T'], propriete: 'Propriété TT', coordX: 10.638617, coordY: 35.829169, meterId: '552200' },
    { id: '2', code: 'SO30', name: 'Siège DRT Sousse & ETT Sousse', commune: 'Sousse', delegation: 'Sousse Medina', address: 'Rue IBN SINA 4000 - Sousse', nature: ['A', 'T', 'C'], propriete: 'Propriété TT', coordX: 10.6431, coordY: 35.8295 },
    { id: '3', code: 'SO02', name: 'Complexe Catacombes', commune: 'Sousse', delegation: 'Sousse Jawhara', address: 'Rue des Catacombes - Sousse 4061', nature: ['T'], propriete: 'Propriété TT', coordX: 10.627883, coordY: 35.817522, meterId: '545040' },
    { id: '4', code: 'SO04', name: 'Complexe Sahloul', commune: 'Sousse', delegation: 'Sousse Jawhara', address: 'Rue Yasser ARAFET - Sahloul - Sousse', nature: ['T'], propriete: 'Propriété TT', coordX: 10.596511, coordY: 35.840546 },
    { id: '5', code: 'SO05', name: 'Complexe Khézama', commune: 'Sousse', delegation: 'Sousse Medina', address: 'Rue Colonel GARNAOUI - Khézama - Est - Sousse', nature: ['T'], propriete: 'Propriété TT', coordX: 10.60949167, coordY: 35.85319167 },
    { id: '6', code: 'SO28', name: 'Complexe Cité Hached( ETT BOUHCINA+CFRT+IT°', commune: 'Sousse', delegation: 'Sousse Jawhara', address: 'Cité Hached - 4002 Sousse', nature: ['A', 'T', 'C'], propriete: 'Propriété TT', coordX: 10.6094361, coordY: 35.82395556 },
    { id: '7', code: 'ETT Khezama', name: 'ETT Khezama', commune: 'Sousse', delegation: 'Sousse Jawhara', address: 'Route de Tunis GP1 khezema Croisement Av. le Perle du Sahel et Rue Imam Boukhari', nature: ['C'], propriete: 'Location, ETT', coordX: 10.609715, coordY: 35.847822 },
    { id: '10', code: 'SO51', name: 'Dépôt Sidi Abdelhamid', commune: 'Sousse', delegation: 'Sousse Sidi Abdelhamid', address: 'Av de l\'Environnement - ZI Sidi Abdelhamid - Sousse', nature: ['T', 'D'], propriete: 'Propriété TT', coordX: 10.669252, coordY: 35.782951, meterId: '548710' },
    { id: '12', code: 'SO26', name: 'Central Erriadh', commune: 'Sousse', delegation: 'Sousse Erriadh', address: 'Rue Abdellaziz RJIBA - Cité Erriadh - Sousse', nature: ['T'], propriete: 'Propriété TT', coordX: 10.607379, coordY: 35.802448, meterId: '542300' },
    { id: '13', code: 'SO40', name: 'Central Erriadh 5', commune: 'Sousse', delegation: 'Sousse Erriadh', address: 'Cité Erriadh 5 - Sousse', nature: ['T'], propriete: 'Propriété TT', coordX: 10.5921583, coordY: 35.7995278, meterId: '542440' },
    { id: '55', code: 'ETT Sahloul', name: 'Espace TT sahloul', commune: 'Sousse', delegation: 'Sousse Jawhara', address: 'Av Yasser Arafet sahloul', nature: ['C'], propriete: 'Location', coordX: 10.5970083, coordY: 35.838603, meterId: '597878951' },

];

export const billingData: Bill[] = [
    { id: 'BILL-0823-01', reference: '552200-AUG23', meterId: '552200', month: 'Août 2023', amount: 8911.22, consumptionKWh: 25499, status: 'Payée', typeTension: 'Moyen Tension Tranche Horaire' },
    { id: 'BILL-0823-02', reference: '542300-AUG23', meterId: '542300', month: 'Août 2023', amount: 5252.54, consumptionKWh: 14938, status: 'Payée', typeTension: 'Moyen Tension Tranche Horaire' },
    { id: 'BILL-0923-01', reference: '542440-SEP23', meterId: '542440', month: 'Septembre 2023', amount: 2658.48, consumptionKWh: 7471, status: 'Payée', typeTension: 'Moyen Tension Tranche Horaire' },
    { id: 'BILL-0923-02', reference: '545040-SEP23', meterId: '545040', month: 'Septembre 2023', amount: 49847.26, consumptionKWh: 148560, status: 'Payée', typeTension: 'Moyen Tension Tranche Horaire' },
    { id: 'BILL-1023-01', reference: '597878951-OCT23', meterId: '597878951', month: 'Octobre 2023', amount: 1280.40, consumptionKWh: 5350, status: 'Impayée', typeTension: 'Basse Tension' },
    { id: 'BILL-1023-02', reference: '587687455-OCT23', meterId: '587687455', month: 'Octobre 2023', amount: 5100.00, consumptionKWh: 22800, status: 'Impayée', typeTension: 'Moyen Tension Forfaitaire' },
];

export const metersData: Meter[] = [
    { id: '537400', buildingId: '16', typeTension: 'Moyenne Tension', status: 'Actif' },
    { id: '542300', buildingId: '12', typeTension: 'Moyenne Tension', status: 'Actif' },
    { id: '542440', buildingId: '13', typeTension: 'Moyenne Tension', status: 'Actif' },
    { id: '545040', buildingId: '3', typeTension: 'Moyenne Tension', status: 'Actif' },
    { id: '548710', buildingId: '10', typeTension: 'Moyenne Tension', status: 'Actif' },
    { id: '597878951', buildingId: '55', typeTension: 'Basse Tension', status: 'Actif' },
    { id: '587687455', equipmentId: 'EQP-005', typeTension: 'Moyenne Tension', status: 'Inactif' },
    { id: '552201', equipmentId: 'EQP-006', typeTension: 'Moyenne Tension', status: 'Actif', coordX: 10.638617, coordY: 35.829169 },
];


export const energyConsumptionData = [
    { month: "May", building1: 5200, building2: 21000 },
    { month: "Jun", building1: 6000, building2: 22500 },
    { month: "Jul", building1: 7500, building2: 24000 },
    { month: "Aug", building1: 5500, building2: 21500 },
    { month: "Sep", building1: 5300, building2: 20500 },
    { month: "Oct", building1: 5400, building2: 22800 },
];
