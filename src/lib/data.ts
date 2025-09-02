
import type { Equipment, Building, Bill, Meter } from './types';

export const equipmentData: Equipment[] = [
  { id: 'EQP-001', name: 'ALU_SO_ERR5_MSI11_7302', type: 'MSI', location: 'ERR5', status: 'En service', lastUpdate: '2023-10-25', fournisseur: 'Alcatel Lucent', typeChassis: '7302', coordX: 10.5921583, coordY: 35.7995278, designation: 'ALU-Erriadh5-Rk_01-Sh_A-7302', compteurId: '542440', dateMiseEnService: '2023-01-15', buildingId: '13' },
  { id: 'EQP-002', name: 'NSN_SO_EZZH_MSI11_5625-G400', type: 'MSI', location: 'EZZH', status: 'En service', lastUpdate: '2023-10-24', fournisseur: 'Siemens', typeChassis: '5625-G400', coordX: 10.585829, coordY: 35.791822, designation: 'Hix_Ezzouhour_1-1', compteurId: '542300', dateMiseEnService: '2023-02-20', buildingId: '12' },
  { id: 'EQP-003', name: 'ALU_SO_HRGL_MSI21_7330', type: 'MSI', location: 'HRGL', status: 'En cours', lastUpdate: '2023-09-15', fournisseur: 'Alcatel Lucent', typeChassis: '7330', coordX: 10.51041, coordY: 36.028373, designation: 'ALU-Hergla-Sh_A-7330', verifiedBy: 'Admin' },
  { id: 'EQP-004', name: 'ALU_SO_KANT_MSN01_MM_Immeuble Zarrouk_7353', type: 'MSN', location: 'KANT', status: 'En service', lastUpdate: '2023-10-26', fournisseur: 'Alcatel Lucent', typeChassis: '7353', coordX: 10.589497, coordY: 35.886259, designation: 'ALU_SO_MM_Immeuble Zarrouk _FTTB', compteurId: '537400', dateMiseEnService: '2022-05-10' },
  { id: 'EQP-005', name: 'HUW_SO_CENN_MSN01_T300', type: 'MSN', location: 'CENN', status: 'switched off', lastUpdate: '2023-10-22', fournisseur: 'Huawei', typeChassis: 'T300', coordX: 10.587450, coordY: 35.735262, designation: 'HW_SO_Cite_Ennour1_T300' },
  { id: 'EQP-006', name: 'ALU_SO_REP_MSI01_7330', type: 'MSI', location: 'SO01', status: 'En cours', lastUpdate: '2023-11-01', fournisseur: 'Alcatel Lucent', typeChassis: '7330', coordX: 10.638617, coordY: 35.829169, designation: 'ALU-Republique-Rk_01-Sh_A-7330', buildingId: '1' },
  { id: 'EQP-007', name: 'NSN_SO_KSIB_MSN01_F-108', type: 'MSN', location: 'KSIB', status: 'En service', lastUpdate: '2024-01-10', fournisseur: 'Nokia Siemens', typeChassis: 'F-108', coordX: 10.58, coordY: 35.78, designation: 'NSN_SO_KSIB_MSN01_F-108', compteurId: 'MTR-NEW-001', dateMiseEnService: '2024-01-10' },
  { id: 'EQP-008', name: 'ALU_SO_SAHL_MSN02_7362', type: 'MSN', location: 'SAHL', status: 'En service', lastUpdate: '2024-02-15', fournisseur: 'Alcatel Lucent', typeChassis: '7362', coordX: 10.60, coordY: 35.84, designation: 'ALU_SO_SAHL_MSN02_7362', compteurId: 'MTR-NEW-002', dateMiseEnService: '2024-02-15' },
];

export const buildingData: Building[] = [
    { id: '1', code: 'SO01', name: 'Complexe Sousse République', commune: 'Sousse', localisation: 'SSEV', address: 'Av de la République - Sousse 4000', nature: ['T'], propriete: 'Propriété TT', coordX: 10.638617, coordY: 35.829169, meterId: '552200' },
    { id: '2', code: 'SO30', name: 'Siège DRT Sousse & ETT Sousse', commune: 'Sousse', localisation: 'SSEV', address: 'Rue IBN SINA 4000 - Sousse', nature: ['A', 'T', 'C'], propriete: 'Propriété TT', coordX: 10.6431, coordY: 35.8295 },
    { id: '3', code: 'SO02', name: 'Complexe Catacombes', commune: 'Sousse', localisation: 'BOHC', address: 'Rue des Catacombes - Sousse 4061', nature: ['T'], propriete: 'Propriété TT', coordX: 10.627883, coordY: 35.817522, meterId: '545040' },
    { id: '4', code: 'SO04', name: 'Complexe Sahloul', commune: 'Sousse', localisation: 'SAHL', address: 'Rue Yasser ARAFET - Sahloul - Sousse', nature: ['T'], propriete: 'Propriété TT', coordX: 10.596511, coordY: 35.840546 },
    { id: '5', code: 'SO05', name: 'Complexe Khézama', commune: 'Sousse', localisation: 'KHEZ', address: 'Rue Colonel GARNAOUI - Khézama - Est - Sousse', nature: ['T'], propriete: 'Propriété TT', coordX: 10.60949167, coordY: 35.85319167 },
    { id: '6', code: 'SO28', name: 'Complexe Cité Hached( ETT BOUHCINA+CFRT+IT°', commune: 'Sousse', localisation: 'BOHC', address: 'Cité Hached - 4002 Sousse', nature: ['A', 'T', 'C'], propriete: 'Propriété TT', coordX: 10.6094361, coordY: 35.82395556 },
    { id: '7', code: 'ETT Khezama', name: 'ETT Khezama', commune: 'Sousse', localisation: 'KHEZ', address: 'Route de Tunis GP1 khezema Croisement Av. le Perle du Sahel et Rue Imam Boukhari', nature: ['C'], propriete: 'Location, ETT', coordX: 10.609715, coordY: 35.847822 },
    { id: '10', code: 'SO51', name: 'Dépôt Sidi Abdelhamid', commune: 'Sousse', localisation: 'SABD', address: 'Av de l\'Environnement - ZI Sidi Abdelhamid - Sousse', nature: ['T', 'D'], propriete: 'Propriété TT', coordX: 10.669252, coordY: 35.782951, meterId: '548710' },
    { id: '12', code: 'SO26', name: 'Central Erriadh', commune: 'Sousse', localisation: 'ERRD', address: 'Rue Abdellaziz RJIBA - Cité Erriadh - Sousse', nature: ['T'], propriete: 'Propriété TT', coordX: 10.607379, coordY: 35.802448, meterId: '542300' },
    { id: '13', code: 'SO40', name: 'Central Erriadh 5', commune: 'Sousse', localisation: 'ERR5', address: 'Cité Erriadh 5 - Sousse', nature: ['T'], propriete: 'Propriété TT', coordX: 10.5921583, coordY: 35.7995278, meterId: '542440' },
    { id: '55', code: 'ETT Sahloul', name: 'Espace TT sahloul', commune: 'Sousse', localisation: 'SAHL', address: 'Av Yasser Arafet sahloul', nature: ['C'], propriete: 'Location', coordX: 10.5970083, coordY: 35.838603, meterId: '597878951' },

];

export const billingData: Bill[] = [
    { id: 'BILL-0823-01', reference: '2023080000001', meterId: '552200', month: 'Août 2023', amount: 8911.22, consumptionKWh: 25499, typeTension: 'Moyen Tension Tranche Horaire', convenableSTEG: true, nombreMois: 12 },
    { id: 'BILL-0823-02', reference: '2023080000002', meterId: '542300', month: 'Août 2023', amount: 5252.54, consumptionKWh: 14938, typeTension: 'Moyen Tension Tranche Horaire', convenableSTEG: true, nombreMois: 12 },
    { id: 'BILL-0923-01', reference: '2023090000001', meterId: '542440', month: 'Septembre 2023', amount: 2658.48, consumptionKWh: 7471, typeTension: 'Moyen Tension Tranche Horaire', convenableSTEG: true, nombreMois: 12 },
    { id: 'BILL-0923-02', reference: '2023090000002', meterId: '545040', month: 'Septembre 2023', amount: 49847.26, consumptionKWh: 148560, typeTension: 'Moyen Tension Tranche Horaire', convenableSTEG: true, nombreMois: 12 },
    { id: 'BILL-1023-01', reference: '2023100000001', meterId: '597878951', month: 'Octobre 2023', amount: 1280.40, consumptionKWh: 5350, typeTension: 'Basse Tension', convenableSTEG: true, nombreMois: 2 },
    { id: 'BILL-1023-02', reference: '2023100000002', meterId: '587687455', month: 'Octobre 2023', amount: 5100.00, consumptionKWh: 22800, typeTension: 'Moyen Tension Forfaitaire', convenableSTEG: true, nombreMois: 2 },
    { id: 'BILL-0723-01', reference: '2023070000001', meterId: '552200', month: 'Juillet 2023', amount: 9200.00, consumptionKWh: 26000, typeTension: 'Moyen Tension Tranche Horaire', convenableSTEG: true, nombreMois: 12 },
    { id: 'BILL-0723-02', reference: '2023070000002', meterId: '542300', month: 'Juillet 2023', amount: 4800.00, consumptionKWh: 14000, typeTension: 'Moyen Tension Tranche Horaire', convenableSTEG: true, nombreMois: 12 },
    { id: 'BILL-0623-01', reference: '2023060000001', meterId: '537400', month: 'Juin 2023', amount: 1500.00, consumptionKWh: 4500, typeTension: 'Moyen Tension Forfaitaire', convenableSTEG: false, montantSTEG: 1550.00, nombreMois: 2 },
    { id: 'BILL-0623-02', reference: '2023060000002', meterId: '548710', month: 'Juin 2023', amount: 3200.00, consumptionKWh: 9000, typeTension: 'Moyen Tension Tranche Horaire', convenableSTEG: true, nombreMois: 12 },
    { id: 'BILL-1123-01', reference: '2023110000001', meterId: '597878951', month: 'Novembre 2023', amount: 1350.00, consumptionKWh: 5500, typeTension: 'Basse Tension', convenableSTEG: true, nombreMois: 2 },
    { id: 'BILL-1123-02', reference: '2023110000002', meterId: '552200', month: 'Novembre 2023', amount: 8500.00, consumptionKWh: 24000, typeTension: 'Moyen Tension Tranche Horaire', convenableSTEG: true, nombreMois: 12 },
    { id: 'BILL-1223-01', reference: '2023120000001', meterId: '542300', month: 'Décembre 2023', amount: 5500.00, consumptionKWh: 15500, typeTension: 'Moyen Tension Tranche Horaire', convenableSTEG: true, nombreMois: 12 },
    { id: 'BILL-1223-02', reference: '2023120000002', meterId: '545040', month: 'Décembre 2023', amount: 48000.00, consumptionKWh: 140000, typeTension: 'Moyen Tension Tranche Horaire', convenableSTEG: true, nombreMois: 12 },
    { id: 'BILL-0124-01', reference: '2024010000001', meterId: '537400', month: 'Janvier 2024', amount: 1800.00, consumptionKWh: 5000, typeTension: 'Moyen Tension Forfaitaire', convenableSTEG: false, montantSTEG: 1800.00, nombreMois: 2 },
    { id: 'BILL-0224-01', reference: '2024020000001', meterId: '597878951', month: 'Février 2024', amount: 1400.00, consumptionKWh: 5800, typeTension: 'Basse Tension', convenableSTEG: true, nombreMois: 2 },
    { id: 'BILL-0324-01', reference: '2024030000001', meterId: '542440', month: 'Mars 2024', amount: 2800.00, consumptionKWh: 8000, typeTension: 'Moyen Tension Tranche Horaire', convenableSTEG: true, nombreMois: 12 },
];

export const metersData: Meter[] = [
    { id: '537400', policeNumber: '25-537400-99', referenceFacteur: '378051241', typeTension: 'Moyen Tension Forfaitaire', status: 'En service', dateMiseEnService: '2022-01-01', description: 'Compteur pour Kantaoui', lastUpdate: '2023-10-15', districtSteg: 'SOUSSE NORD' },
    { id: '542300', policeNumber: '25-542300-99', referenceFacteur: '378051242', buildingId: '12', typeTension: 'Moyen Tension Tranche Horaire', status: 'En service', dateMiseEnService: '2021-11-15', lastUpdate: '2023-10-15', districtSteg: 'SOUSSE CENTRE' },
    { id: '542440', policeNumber: '25-542440-99', referenceFacteur: '378051243', buildingId: '13', typeTension: 'Moyen Tension Tranche Horaire', status: 'En service', dateMiseEnService: '2021-12-20', lastUpdate: '2023-10-15', districtSteg: 'SOUSSE CENTRE' },
    { id: '545040', policeNumber: '25-545040-99', referenceFacteur: '378051244', buildingId: '3', typeTension: 'Moyen Tension Tranche Horaire', status: 'En service', dateMiseEnService: '2020-05-10', lastUpdate: '2023-10-15', districtSteg: 'SOUSSE CENTRE' },
    { id: '548710', policeNumber: '25-548710-99', referenceFacteur: '378051245', buildingId: '10', typeTension: 'Moyen Tension Tranche Horaire', status: 'En service', dateMiseEnService: '2019-03-25', lastUpdate: '2023-10-15', districtSteg: 'SOUSSE CENTRE' },
    { id: '597878951', policeNumber: '25-597878951-99', referenceFacteur: '378051246', buildingId: '55', typeTension: 'Basse Tension', status: 'En service', dateMiseEnService: '2023-08-01', lastUpdate: '2023-10-15', districtSteg: 'SOUSSE CENTRE' },
    { id: '587687455', policeNumber: '25-587687455-99', referenceFacteur: '378051247', typeTension: 'Moyen Tension Forfaitaire', status: 'switched off', description: 'Ancien compteur pour équipement Huawei, maintenant résilié.', lastUpdate: '2023-10-22', districtSteg: 'SOUSSE CENTRE' },
    { id: '552201', policeNumber: '25-552201-99', referenceFacteur: '378051248', typeTension: 'Moyen Tension Tranche Horaire', status: 'En cours', dateDemandeInstallation: '2023-11-05', description: 'En attente d\'installation pour le nouveau MSI.', lastUpdate: '2023-11-05', districtSteg: 'SOUSSE CENTRE' },
    { id: '552200', policeNumber: '25-552200-99', referenceFacteur: '378051249', buildingId: '1', typeTension: 'Moyen Tension Tranche Horaire', status: 'En service', dateMiseEnService: '2022-03-10', description: 'Compteur principal du Complexe Sousse République.', lastUpdate: '2023-10-15', districtSteg: 'SOUSSE CENTRE' },
    { id: 'MTR-NEW-001', policeNumber: '25-600001-99', typeTension: 'Basse Tension', status: 'En service', dateMiseEnService: '2024-01-10', description: 'Nouveau compteur pour équipement NSN à Ksiba', lastUpdate: '2024-01-10', districtSteg: 'SOUSSE CENTRE' },
    { id: 'MTR-NEW-002', policeNumber: '25-600002-99', typeTension: 'Moyen Tension Tranche Horaire', status: 'En service', dateMiseEnService: '2024-02-15', description: 'Nouveau compteur pour équipement ALU à Sahloul', lastUpdate: '2024-02-15', districtSteg: 'SOUSSE CENTRE' },
];


export const energyConsumptionData = [
    { month: "May", building1: 5200, building2: 21000 },
    { month: "Jun", building1: 6000, building2: 22500 },
    { month: "Jul", building1: 7500, building2: 24000 },
    { month: "Aug", building1: 5500, building2: 21500 },
    { month: "Sep", building1: 5300, building2: 20500 },
    { month: "Oct", building1: 5400, building2: 22800 },
];

    
