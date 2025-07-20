import type { Equipment, Building, Bill, Anomaly } from './types';

export const equipmentData: Equipment[] = [
  { id: 'EQP-001', name: 'Router-A1', type: 'Network Router', location: 'Building 1 - Floor 2', status: 'Active', lastUpdate: '2023-10-25' },
  { id: 'EQP-002', name: 'Switch-B1', type: 'Network Switch', location: 'Building 1 - Floor 1', status: 'Active', lastUpdate: '2023-10-24' },
  { id: 'EQP-003', name: 'Server-C1', type: 'Data Server', location: 'Building 2 - Data Center', status: 'Inactive', lastUpdate: '2023-09-15' },
  { id: 'EQP-004', name: 'Firewall-D1', type: 'Security Appliance', location: 'Building 1 - Main Office', status: 'Maintenance', lastUpdate: '2023-10-26' },
  { id: 'EQP-005', name: 'AccessPoint-E1', type: 'Wireless AP', location: 'Building 2 - Floor 3', status: 'Active', lastUpdate: '2023-10-22' },
];

export const buildingData: Building[] = [
  { id: 'BLD-01', name: 'Main Office', address: '123 Tech Avenue, Sousse', type: 'Owned', energyManager: 'Ali Ben Salah' },
  { id: 'BLD-02', name: 'Data Center', address: '456 Innovation Drive, Sousse', type: 'Rented', energyManager: 'Fatma Cherif' },
  { id: 'BLD-03', name: 'Warehouse', address: '789 Industrial Park, Sousse', type: 'Owned', energyManager: 'Mohamed Ali' },
];

export const billingData: Bill[] = [
    { id: 'BILL-0823-01', buildingId: 'BLD-01', buildingName: 'Main Office', month: 'August 2023', amount: 1250.75, consumptionKWh: 5200, status: 'Paid' },
    { id: 'BILL-0823-02', buildingId: 'BLD-02', buildingName: 'Data Center', month: 'August 2023', amount: 4800.50, consumptionKWh: 21000, status: 'Paid' },
    { id: 'BILL-0923-01', buildingId: 'BLD-01', buildingName: 'Main Office', month: 'September 2023', amount: 1320.00, consumptionKWh: 5500, status: 'Paid' },
    { id: 'BILL-0923-02', buildingId: 'BLD-02', buildingName: 'Data Center', month: 'September 2023', amount: 4750.25, consumptionKWh: 20500, status: 'Paid' },
    { id: 'BILL-1023-01', buildingId: 'BLD-01', buildingName: 'Main Office', month: 'October 2023', amount: 1280.40, consumptionKWh: 5350, status: 'Unpaid' },
    { id: 'BILL-1023-02', buildingId: 'BLD-02', buildingName: 'Data Center', month: 'October 2023', amount: 5100.00, consumptionKWh: 22800, status: 'Unpaid' },
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
    { id: 'ANM-001', timestamp: '2023-10-26 03:15', building: 'Data Center', description: 'Unusual 20% spike in consumption overnight.', severity: 'High' },
    { id: 'ANM-002', timestamp: '2023-10-24 14:00', building: 'Main Office', description: 'Consumption dropped 30% during peak hours.', severity: 'Medium' },
    { id: 'ANM-003', timestamp: '2023-10-22 09:30', building: 'Warehouse', description: 'Minor fluctuation detected, above 15% threshold.', severity: 'Low' },
];
