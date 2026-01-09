
export type Allele = 'XA' | 'Xa' | 'Y';

export interface GenotypeInfo {
  code: string;
  sex: '雌性' | '雄性';
  phenotype: '红眼' | '白眼';
}

export interface SimulationResult {
  genotype: string;
  count: number;
  theoreticalCount: number;
  percentage: number;
  theoreticalPercentage: number;
  info: GenotypeInfo;
}

export interface ConvergencePoint {
  n: number;
  deviation: number;
}
