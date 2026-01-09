
import { Allele, GenotypeInfo, SimulationResult, ConvergencePoint } from '../types';

export const getGenotypeInfo = (genotype: string): GenotypeInfo => {
  const parts = genotype.split(' ').sort();
  const isMale = parts.includes('Y');
  const hasDominant = parts.includes('XA');
  
  return {
    code: genotype,
    sex: isMale ? '雄性' : '雌性',
    phenotype: hasDominant ? '红眼' : '白眼'
  };
};

export const parseGenotype = (input: string): Allele[] => {
  return input.trim().split(/\s+/) as Allele[];
};

export const calculateTheoretical = (femaleInput: string, maleInput: string, totalN: number): Record<string, number> => {
  const femaleGametes = parseGenotype(femaleInput);
  const maleGametes = parseGenotype(maleInput);
  
  const theory: Record<string, number> = {};
  const probPerCombo = 1 / (femaleGametes.length * maleGametes.length);

  femaleGametes.forEach(fg => {
    maleGametes.forEach(mg => {
      const g = [fg, mg].sort().reverse().join(' '); // Keep standard notation XA Xa or XA Y
      theory[g] = (theory[g] || 0) + probPerCombo;
    });
  });

  const finalTheory: Record<string, number> = {};
  Object.keys(theory).forEach(g => {
    finalTheory[g] = theory[g] * totalN;
  });

  return finalTheory;
};

export const runSimulationBatch = (
  femaleInput: string, 
  maleInput: string, 
  n: number
): { results: SimulationResult[], convergence: ConvergencePoint[] } => {
  const femaleGametes = parseGenotype(femaleInput);
  const maleGametes = parseGametes(maleInput);
  const theoryMap = calculateTheoretical(femaleInput, maleInput, n);
  const totalTheoreticalProb: Record<string, number> = {};
  Object.keys(theoryMap).forEach(k => totalTheoreticalProb[k] = theoryMap[k] / n);

  const counts: Record<string, number> = {};
  const convergence: ConvergencePoint[] = [];
  
  // To make the "difference decreases" visible, we record deviation at intervals
  const interval = Math.max(1, Math.floor(n / 50));

  for (let i = 1; i <= n; i++) {
    const fg = femaleGametes[Math.floor(Math.random() * femaleGametes.length)];
    const mg = maleGametes[Math.floor(Math.random() * maleGametes.length)];
    const g = [fg, mg].sort().reverse().join(' ');
    
    counts[g] = (counts[g] || 0) + 1;

    if (i % interval === 0 || i === n) {
      // Calculate Average Absolute Deviation
      let totalDev = 0;
      Object.keys(totalTheoreticalProb).forEach(k => {
        const expProb = (counts[k] || 0) / i;
        const theoProb = totalTheoreticalProb[k];
        totalDev += Math.abs(expProb - theoProb);
      });
      convergence.push({ n: i, deviation: totalDev / Object.keys(totalTheoreticalProb).length });
    }
  }

  const results: SimulationResult[] = Object.keys(theoryMap).map(g => ({
    genotype: g,
    count: counts[g] || 0,
    theoreticalCount: theoryMap[g],
    percentage: ((counts[g] || 0) / n) * 100,
    theoreticalPercentage: (theoryMap[g] / n) * 100,
    info: getGenotypeInfo(g)
  }));

  return { results, convergence };
};

// Helper for male gametes to ensure 'Y' is handled
const parseGametes = (input: string): Allele[] => {
  return input.trim().split(/\s+/) as Allele[];
};
