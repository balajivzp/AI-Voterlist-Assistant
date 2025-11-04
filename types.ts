
export interface Voter {
  serialNumber: string;
  voterId: string;
  name: string;
  relationName: string;
  relationType: 'father' | 'husband' | 'mother' | 'other';
  houseNumber: string;
  age: number;
  gender: 'male' | 'female' | 'other';
}

export interface ConstituencyInfo {
  assembly: {
    number: number;
    name: string;
    category: string;
  };
  parliamentary: {
    number: number;
    name: string;
    category: string;
  };
}

export interface PollingStationInfo {
  partNumber: number;
  name: string;
  address: string;
  mainTownOrVillage: string;
  policeStation: string;
  district: string;
  pinCode: string;
}

export interface VoterStats {
  startingSerialNumber: number;
  endingSerialNumber: number;
  maleVoters: number;
  femaleVoters: number;
  thirdGenderVoters: number;
  totalVoters: number;
}

export interface ExtractedData {
  constituencyInfo: ConstituencyInfo;
  pollingStationInfo: PollingStationInfo;
  voterStats: VoterStats;
  voters: Voter[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  voters?: Voter[];
}
