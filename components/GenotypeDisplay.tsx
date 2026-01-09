
import React from 'react';

interface Props {
  genotype: string;
  sex: '雌性' | '雄性';
  phenotype: '红眼' | '白眼';
}

const GenotypeDisplay: React.FC<Props> = ({ genotype, sex, phenotype }) => {
  const isRed = phenotype === '红眼';
  const isFemale = sex === '雌性';

  return (
    <div className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm border border-slate-100">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${isRed ? 'bg-red-500' : 'bg-slate-300'}`}>
        {isRed ? 'R' : 'W'}
      </div>
      <div>
        <div className="text-sm font-semibold text-slate-700">{genotype}</div>
        <div className="text-xs text-slate-500">{sex} · {phenotype}</div>
      </div>
    </div>
  );
};

export default GenotypeDisplay;
