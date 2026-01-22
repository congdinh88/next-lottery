export interface Employee {
  id: string;
  name: string;
  position: string;
  eligible: boolean;
}

export type PrizeType =
  | "special1"
  | "special2"
  | "first"
  | "second1"
  | "second2"
  | "third1"
  | "third2"
  | "third3"
  | "fourth1"
  | "fourth2"
  | "consolation1"
  | "consolation2"
  | "consolation3";

export interface PrizeConfig {
  name: string;
  total: number;
}

export interface WinnerWithIndex extends Employee {
  index: number;
}

export interface SelectedWinner {
  prizeType: PrizeType;
  index: number;
  winner: Employee;
}

export interface HoveredWinner {
  prizeType: PrizeType;
  index: number;
}

export interface UseLotteryDataProps {
  prizeConfig: Record<string, PrizeConfig>;
  PRIZE_ORDER: PrizeType[];
}

export interface WinnersState {
  special1: Employee[];
  special2: Employee[];
  first: Employee[];
  second1: Employee[];
  second2: Employee[];
  third1: Employee[];
  third2: Employee[];
  third3: Employee[];
  fourth1: Employee[];
  fourth2: Employee[];
  consolation1: Employee[];
  consolation2: Employee[];
  consolation3: Employee[];
}
