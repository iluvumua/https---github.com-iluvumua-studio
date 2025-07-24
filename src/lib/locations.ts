
export interface Location {
    code: string;
    abbreviation: string;
    localite: string;
    commune: string;
    districtSteg: string;
    csc: string;
    uls: string;
}

export const locationsData: Location[] = [
  { code: 'EZZH', abbreviation: 'EZZH', localite: 'Ezzouhour', commune: 'Ezzouhour', districtSteg: 'SOUSSE CENTRE', csc: 'CSC1', uls: 'ULS_Msaken' },
  { code: 'KSIB', abbreviation: 'KSIB', localite: 'Ksiba', commune: 'Ksiba & Tharayette', districtSteg: 'SOUSSE CENTRE', csc: 'CSC1', uls: 'ULS_Msaken' },
  { code: 'THRY', abbreviation: 'THRY', localite: 'Therayette', commune: 'Ksiba & Tharayette', districtSteg: 'SOUSSE CENTRE', csc: 'CSC1', uls: 'ULS_Msaken' },
  { code: 'MESS', abbreviation: 'MESS', localite: 'Messaadine', commune: 'Messadine', districtSteg: 'SOUSSE CENTRE', csc: 'CSC1', uls: 'ULS_Msaken' },
  { code: 'BKTH', abbreviation: 'BKTH', localite: 'Beni Kalthoum', commune: 'Msaken', districtSteg: 'SOUSSE CENTRE', csc: 'CSC1', uls: 'ULS_Msaken' },
  { code: 'BORJ', abbreviation: 'BORJ', localite: 'Borjine', commune: 'Msaken', districtSteg: 'SOUSSE CENTRE', csc: 'CSC1', uls: 'ULS_Msaken' },
  { code: 'CENN', abbreviation: 'CENN', localite: 'Cité Ennour', commune: 'Msaken', districtSteg: 'SOUSSE CENTRE', csc: 'CSC1', uls: 'ULS_Msaken' },
  { code: 'KNES', abbreviation: 'KNES', localite: 'Khenaies', commune: 'Msaken', districtSteg: 'SOUSSE CENTRE', csc: 'CSC1', uls: 'ULS_Msaken' },
  { code: 'MURD', abbreviation: 'MURD', localite: 'Mourdine', commune: 'Msaken', districtSteg: 'SOUSSE CENTRE', csc: 'CSC1', uls: 'ULS_Msaken' },
  { code: 'MSAK', abbreviation: 'MSAK', localite: 'Msaken', commune: 'Msaken', districtSteg: 'SOUSSE CENTRE', csc: 'CSC1', uls: 'ULS_Msaken' },
  { code: 'KROS', abbreviation: 'KROS', localite: 'Kroussia', commune: 'Sidi El Heni', districtSteg: 'SOUSSE CENTRE', csc: 'CSC1', uls: 'ULS_Msaken' },
  { code: 'SHNI', abbreviation: 'SHNI', localite: 'Sidi El Heni', commune: 'Sidi El Heni', districtSteg: 'SOUSSE CENTRE', csc: 'CSC1', uls: 'ULS_Msaken' },
  { code: 'ERRD', abbreviation: 'ERRD', localite: 'Erriadh', commune: 'Sousse', districtSteg: 'SOUSSE CENTRE', csc: 'CSC1', uls: 'ULS_Msaken' },
  { code: 'ERR5', abbreviation: 'ERR5', localite: 'Erriadh 5', commune: 'Sousse', districtSteg: 'SOUSSE CENTRE', csc: 'CSC1', uls: 'ULS_Msaken' },
  { code: 'ZSSE', abbreviation: 'ZSSE', localite: 'Zaouiet Sousse', commune: 'Zaouiet Sousse', districtSteg: 'SOUSSE CENTRE', csc: 'CSC1', uls: 'ULS_Msaken' },
  { code: 'ENGR', abbreviation: 'ENGR', localite: 'Ennagr', commune: 'Kalaa Sghira', districtSteg: 'SOUSSE NORD', csc: 'CSC1', uls: 'ULS_Sousse' },
  { code: 'KSGH', abbreviation: 'KSGH', localite: 'Kalaa Sghira', commune: 'Kalaa Sghira', districtSteg: 'SOUSSE NORD', csc: 'CSC1', uls: 'ULS_Sousse' },
  { code: 'BOHC', abbreviation: 'BOHC', localite: 'Bouhcina Catacombe', commune: 'Sousse', districtSteg: 'SOUSSE CENTRE', csc: 'CSC1', uls: 'ULS_Sousse' },
  { code: 'IKLD', abbreviation: 'IKLD', localite: 'Ibn Khouldoune', commune: 'Sousse', districtSteg: 'SOUSSE CENTRE', csc: 'CSC1', uls: 'ULS_Sousse' },
  { code: 'SABD', abbreviation: 'SABD', localite: 'Sidi Abdelhamid', commune: 'Sousse', districtSteg: 'SOUSSE CENTRE', csc: 'CSC1', uls: 'ULS_Sousse' },
  { code: 'SSEV', abbreviation: 'SSEV', localite: 'Sousse Medina', commune: 'Sousse', districtSteg: 'SOUSSE CENTRE', csc: 'CSC1', uls: 'ULS_Sousse' },
  { code: 'AGCI', abbreviation: 'AGCI', localite: 'Aïn Garci', commune: 'Ain Garci', districtSteg: 'SOUSSE NORD', csc: 'CSC2', uls: 'ULS_Kantaoui' },
  { code: 'MDBW', abbreviation: 'MDBW', localite: 'Menzel Dar Belwaer', commune: 'Ain Garci', districtSteg: 'SOUSSE NORD', csc: 'CSC2', uls: 'ULS_Kantaoui' },
  { code: 'AKDA', abbreviation: 'AKDA', localite: 'Akouda', commune: 'Akouda', districtSteg: 'SOUSSE NORD', csc: 'CSC2', uls: 'ULS_Kantaoui' },
  { code: 'TANT', abbreviation: 'TANT', localite: 'Tantana', commune: 'Akouda', districtSteg: 'SOUSSE NORD', csc: 'CSC2', uls: 'ULS_Kantaoui' },
  { code: 'ZIAK', abbreviation: 'ZIAK', localite: 'Zone Industrielle Akouda', commune: 'Akouda', districtSteg: 'SOUSSE NORD', csc: 'CSC2', uls: 'ULS_Kantaoui' },
  { code: 'ARAH', abbreviation: 'ARAH', localite: 'Aïn Errahma', commune: 'Bouficha', districtSteg: 'SOUSSE NORD', csc: 'CSC2', uls: 'ULS_Kantaoui' },
  { code: 'BOUF', abbreviation: 'BOUF', localite: 'Bouficha', commune: 'Bouficha', districtSteg: 'SOUSSE NORD', csc: 'CSC2', uls: 'ULS_Kantaoui' },
  { code: 'ESLM', abbreviation: 'ESLM', localite: 'Essalloum', commune: 'Bouficha', districtSteg: 'SOUSSE NORD', csc: 'CSC2', uls: 'ULS_Kantaoui' },
  { code: 'SKHL', abbreviation: 'SKHL', localite: 'Sidi Khalifa', commune: 'Bouficha', districtSteg: 'SOUSSE NORD', csc: 'CSC2', uls: 'ULS_Kantaoui' },
  { code: 'CHTM', abbreviation: 'CHTM', localite: 'Chatt Mariem', commune: 'Chott Mariem', districtSteg: 'SOUSSE NORD', csc: 'CSC2', uls: 'ULS_Kantaoui' },
  { code: 'AMDH', abbreviation: 'AMDH', localite: 'Aïn Mdhaker', commune: 'Enfidha', districtSteg: 'SOUSSE NORD', csc: 'CSC2', uls: 'ULS_Kantaoui' },
  { code: 'CHGR', abbreviation: 'CHGR', localite: 'Chegarnia', commune: 'Enfidha', districtSteg: 'SOUSSE NORD', csc: 'CSC2', uls: 'ULS_Kantaoui' },
  { code: 'ENFD', abbreviation: 'ENFD', localite: 'Enfidha', commune: 'Enfidha', districtSteg: 'SOUSSE NORD', csc: 'CSC2', uls: 'ULS_Kantaoui' },
  { code: 'MFTH', abbreviation: 'MFTH', localite: 'Menzel Fateh', commune: 'Enfidha', districtSteg: 'SOUSSE NORD', csc: 'CSC2', uls: 'ULS_Kantaoui' },
  { code: 'TAKR', abbreviation: 'TAKR', localite: 'Takrouna', commune: 'Enfidha', districtSteg: 'SOUSSE NORD', csc: 'CSC2', uls: 'ULS_Kantaoui' },
  { code: 'KANT', abbreviation: 'KANT', localite: 'Kantaoui', commune: 'Hammam Sousse', districtSteg: 'SOUSSE NORD', csc: 'CSC2', uls: 'ULS_Kantaoui' },
  { code: 'HRGL', abbreviation: 'HRGL', localite: 'Hergla', commune: 'Hergla', districtSteg: 'SOUSSE NORD', csc: 'CSC2', uls: 'ULS_Kantaoui' },
  { code: 'KOND', abbreviation: 'KOND', localite: 'Kondar', commune: 'Kondar', districtSteg: 'SOUSSE NORD', csc: 'CSC2', uls: 'ULS_Kantaoui' },
  { code: 'MGAR', abbreviation: 'MGAR', localite: 'Menzel Gare', commune: 'Sidi Bouali', districtSteg: 'SOUSSE NORD', csc: 'CSC2', uls: 'ULS_Kantaoui' },
  { code: 'SBOU', abbreviation: 'SBOU', localite: 'Sidi Bouali', commune: 'Sidi Bouali', districtSteg: 'SOUSSE NORD', csc: 'CSC2', uls: 'ULS_Kantaoui' },
  { code: 'KHEZ', abbreviation: 'KHEZ', localite: 'Khezama', commune: 'Sousse', districtSteg: 'SOUSSE NORD', csc: 'CSC2', uls: 'ULS_Kantaoui' },
  { code: 'HSSE', abbreviation: 'HSSE', localite: 'Hammam Sousse', commune: 'Hammam Sousse', districtSteg: 'SOUSSE NORD', csc: 'CSC2', uls: 'ULS_Sahloul' },
  { code: 'KAKE', abbreviation: 'KAKE', localite: 'Kalaa Kebira', commune: 'Kalaa Kebira', districtSteg: 'SOUSSE NORD', csc: 'CSC2', uls: 'ULS_Sahloul' },
  { code: 'SAHL', abbreviation: 'SAHL', localite: 'Sahloul', commune: 'Sousse', districtSteg: 'SOUSSE CENTRE', csc: 'CSC2', uls: 'ULS_Sahloul' },
];
