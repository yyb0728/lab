
import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
import { Play, RotateCcw, Info, Settings2, BarChart3, TrendingDown, FlaskConical, Beaker } from 'lucide-react';
import { runSimulationBatch } from './services/geneticsEngine';
import { SimulationResult, ConvergencePoint } from './types';
import GenotypeDisplay from './components/GenotypeDisplay';
import { GoogleGenAI } from "@google/genai";

const App: React.FC = () => {
  const [femaleG, setFemaleG] = useState('XA Xa');
  const [maleG, setMaleG] = useState('XA Y');
  const [sampleSize, setSampleSize] = useState(1000);
  const [simulationData, setSimulationData] = useState<{ results: SimulationResult[], convergence: ConvergencePoint[] } | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);

  const handleSimulate = () => {
    setIsSimulating(true);
    // Add small delay to show simulation intent
    setTimeout(() => {
      const results = runSimulationBatch(femaleG, maleG, sampleSize);
      setSimulationData(results);
      setIsSimulating(false);
      generateAIExplanation(results.results);
    }, 300);
  };

  const generateAIExplanation = async (results: SimulationResult[]) => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const summary = results.map(r => `${r.genotype}(${r.info.sex}${r.info.phenotype}): 实际${r.count} vs 理论${r.theoreticalCount.toFixed(1)}`).join(', ');
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `作为一个遗传学专家，请分析以下摩尔根伴性遗传模拟实验的数据：${summary}。总样本量为${sampleSize}。请简短说明：1. 实验结果是否符合预期？2. 大数定律如何在此体现？3. 该杂交组合的遗传学意义（150字以内）。`,
      });
      setAiExplanation(response.text);
    } catch (error) {
      console.error("AI explanation failed", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      {/* Header */}
      <header className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200">
            <FlaskConical className="text-white w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">摩尔根伴性遗传实验室</h1>
            <p className="text-slate-500 text-sm">果蝇眼色遗传模拟与大数定律观察</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 bg-white p-1 rounded-xl shadow-sm border border-slate-200">
          <button 
            onClick={() => setSampleSize(100)} 
            className={`px-4 py-2 rounded-lg text-sm transition-all ${sampleSize === 100 ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-500 hover:bg-slate-50'}`}
          >100</button>
          <button 
            onClick={() => setSampleSize(1000)} 
            className={`px-4 py-2 rounded-lg text-sm transition-all ${sampleSize === 1000 ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-500 hover:bg-slate-50'}`}
          >1,000</button>
          <button 
            onClick={() => setSampleSize(10000)} 
            className={`px-4 py-2 rounded-lg text-sm transition-all ${sampleSize === 10000 ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-500 hover:bg-slate-50'}`}
          >10,000</button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar Controls */}
        <section className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-2 mb-6">
              <Settings2 className="w-5 h-5 text-indigo-600" />
              <h2 className="font-semibold text-slate-800">实验设置</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">雌性亲本基因型 (P1)</label>
                <select 
                  value={femaleG} 
                  onChange={(e) => setFemaleG(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="XA XA">红眼纯合子 (XA XA)</option>
                  <option value="XA Xa">红眼杂合子 (XA Xa)</option>
                  <option value="Xa Xa">白眼 (Xa Xa)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">雄性亲本基因型 (P2)</label>
                <select 
                  value={maleG} 
                  onChange={(e) => setMaleG(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="XA Y">红眼 (XA Y)</option>
                  <option value="Xa Y">白眼 (Xa Y)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">子代数量 (N): {sampleSize.toLocaleString()}</label>
                <input 
                  type="range" 
                  min="10" 
                  max="50000" 
                  step="10" 
                  value={sampleSize} 
                  onChange={(e) => setSampleSize(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              <button 
                onClick={handleSimulate}
                disabled={isSimulating}
                className="w-full mt-4 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-indigo-100 disabled:opacity-50"
              >
                {isSimulating ? <RotateCcw className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
                开始模拟实验
              </button>
            </div>
          </div>

          {/* AI Explanation Card */}
          {aiExplanation && (
            <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100">
              <div className="flex items-center gap-2 mb-3">
                <Beaker className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-indigo-900">导师解析</h3>
              </div>
              <p className="text-sm text-indigo-800 leading-relaxed whitespace-pre-wrap">
                {aiExplanation}
              </p>
            </div>
          )}
        </section>

        {/* Dashboard Content */}
        <section className="lg:col-span-8 space-y-8">
          {!simulationData ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-white rounded-3xl border border-dashed border-slate-300 min-h-[500px]">
              <FlaskConical className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-lg">请点击“开始模拟实验”以生成数据</p>
            </div>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                  <div className="flex items-center gap-2 mb-4">
                    <BarChart3 className="w-5 h-5 text-indigo-600" />
                    <h3 className="font-semibold text-slate-800">性状分布对比 (实际 vs 理论)</h3>
                  </div>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={simulationData.results}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="genotype" axisLine={false} tickLine={false} />
                        <YAxis axisLine={false} tickLine={false} />
                        <Tooltip 
                          contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                        />
                        <Legend iconType="circle" />
                        <Bar name="实际数量" dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                        <Bar name="理论数量" dataKey="theoreticalCount" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingDown className="w-5 h-5 text-emerald-600" />
                    <h3 className="font-semibold text-slate-800">收敛性分析 (误差随样本量变化)</h3>
                  </div>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={simulationData.convergence}>
                        <defs>
                          <linearGradient id="colorDev" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="n" axisLine={false} tickLine={false} label={{ value: '样本量', position: 'insideBottom', offset: -5 }} />
                        <YAxis axisLine={false} tickLine={false} label={{ value: '平均偏差', angle: -90, position: 'insideLeft' }} />
                        <Tooltip />
                        <Area type="monotone" dataKey="deviation" stroke="#10b981" fillOpacity={1} fill="url(#colorDev)" name="平均绝对偏差" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Table List */}
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-semibold text-slate-800">实验详细数据报告</h3>
                  <span className="text-xs font-medium px-3 py-1 bg-slate-100 text-slate-500 rounded-full">N = {sampleSize}</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-500 text-sm uppercase tracking-wider">
                      <tr>
                        <th className="px-6 py-4 font-semibold">基因型</th>
                        <th className="px-6 py-4 font-semibold">性别</th>
                        <th className="px-6 py-4 font-semibold">表现型</th>
                        <th className="px-6 py-4 font-semibold text-right">实际数量</th>
                        <th className="px-6 py-4 font-semibold text-right">理论比例</th>
                        <th className="px-6 py-4 font-semibold text-right">实际比例</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {simulationData.results.map((r, i) => (
                        <tr key={i} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 font-mono font-medium text-indigo-600">{r.genotype}</td>
                          <td className="px-6 py-4 text-slate-600">{r.info.sex}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-md text-xs font-bold ${r.info.phenotype === '红眼' ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-600'}`}>
                              {r.info.phenotype}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right font-semibold text-slate-800">{r.count}</td>
                          <td className="px-6 py-4 text-right text-slate-400">{r.theoreticalPercentage.toFixed(1)}%</td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <span className="font-bold text-slate-700">{r.percentage.toFixed(2)}%</span>
                              <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-500" style={{ width: `${r.percentage}%` }}></div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </section>
      </main>

      {/* Footer Instructions */}
      <footer className="max-w-7xl mx-auto mt-12 mb-8 p-8 bg-white rounded-3xl border border-slate-200 text-sm text-slate-500 leading-relaxed">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-slate-700 mb-2">关于本模拟器：</h4>
            <p>
              本程序通过伪随机算法模拟孟德尔及摩尔根遗传定律。<b>大数定律（Law of Large Numbers）</b>指出，随着实验重复次数（N）的增加，事件发生的频率（实验值）将无限逼近其期望（理论值）。
              在右侧的“收敛性分析”图表中，你可以清晰地观察到随着子代数量上升，平均绝对偏差（Deviation）逐渐趋向于零的过程。这揭示了统计学在遗传学研究中的重要性。
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
