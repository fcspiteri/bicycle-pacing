import React, { useState, useMemo, useEffect } from 'react';
import { calculatePacing } from '../utils/physics';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, ComposedChart, ReferenceLine 
} from 'recharts';

export default function PacerApp() {
  const [stats, setStats] = useState({ ftp: 280, wPrime: 15000, weight: 75 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const olhGrades = [
    0.04, 0.08, 0.08, 0.06, 0.07, 0.08, 0.07, 0.08, 
    0.09, 0.07, 0.08, 0.07, 0.07, 0.08, 0.09, 0.10, 
    0.06, 0.08, 0.07, 0.09, 0.08, 0.06, 0.05, 0.04
  ];

  const { totalTime, results } = useMemo(() => 
    calculatePacing(stats.ftp, stats.wPrime, stats.weight, olhGrades), 
    [stats]
  );

  const chartData = useMemo(() => {
    if (!results || results.length === 0) return [];
    return results.map((r, i) => ({
      dist: `${(i * 0.125).toFixed(2)}`,
      power: Math.round(r.targetP),
      wBal: Math.round(r.wBal),
      grade: parseFloat((r.grade * 100).toFixed(1))
    }));
  }, [results]);

  if (!mounted) return <div className="p-10 text-center font-sans">Initialising Physics Engine...</div>;

  // Calculate Gradient Offset with safety bounds
  const powerValues = chartData.map(d => d.power);
  const chartMin = Math.min(...powerValues, stats.ftp) - 20;
  const chartMax = Math.max(...powerValues, stats.ftp) + 20;
  const range = chartMax - chartMin;
  const ftpOffset = range !== 0 ? Math.min(Math.max(1 - (stats.ftp - chartMin) / range, 0), 1) : 0.5;

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto font-sans bg-slate-50 min-h-screen text-slate-900">
      <header className="mb-8">
        <h1 className="text-4xl font-black italic tracking-tighter">OLH <span className="text-indigo-600">PACER</span></h1>
        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em]">Old La Honda Road Optimization</p>
      </header>

      {/* Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {['ftp', 'wPrime', 'weight'].map((key) => (
          <div key={key} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">
              {key === 'wPrime' ? "W' (Joules)" : key.toUpperCase()}
            </label>
            <input 
              type="number" 
              value={stats[key]} 
              onChange={e => setStats({...stats, [key]: Number(e.target.value)})} 
              className="text-xl font-mono font-bold w-full text-indigo-600 outline-none"
            />
          </div>
        ))}
      </div>

      <div className="space-y-6">
        {/* Power Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-bold text-slate-800">Target Power vs CP</h2>
            <div className="text-2xl font-black text-indigo-600">
              {Math.floor(totalTime / 60)}:{(totalTime % 60).toFixed(0).padStart(2, '0')}
            </div>
          </div>
          
          <div className="h-[300px] w-full min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData}>
                <defs>
                  <linearGradient id="pacingGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset={ftpOffset} stopColor="#ef4444" stopOpacity={0.8} />
                    <stop offset={ftpOffset} stopColor="#22c55e" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="dist" tick={{fontSize: 10}} />
                <YAxis domain={[chartMin, chartMax]} tick={{fontSize: 10}} />
                <Tooltip />
                <ReferenceLine y={stats.ftp} stroke="#475569" strokeDasharray="5 5" strokeWidth={2} />
                <Area 
                  type="stepAfter" 
                  dataKey="power" 
                  stroke="#4338ca" 
                  strokeWidth={2} 
                  fill="url(#pacingGradient)" 
                  isAnimationActive={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* W' Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="font-bold text-slate-800 mb-6">W' Balance</h2>
          <div className="h-[200px] w-full min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="dist" hide />
                <YAxis domain={[0, stats.wPrime]} tick={{fontSize: 10}} />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="wBal" 
                  stroke="#f43f5e" 
                  fill="#f43f5e" 
                  fillOpacity={0.1} 
                  strokeWidth={2} 
                  isAnimationActive={false} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
