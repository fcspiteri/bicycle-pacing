import React, { useState, useMemo, useEffect } from 'react';
import { calculatePacing } from '../utils/physics';
import { 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  ComposedChart,
  Bar
} from 'recharts';

export default function PacerApp() {
  const [stats, setStats] = useState({ ftp: 280, wPrime: 18000, weight: 75 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const olhGrades = [
    0.04, 0.08, 0.08, 0.06, 0.07, 0.08, 0.07, 0.08, 
    0.09, 0.07, 0.08, 0.07, 0.07, 0.08, 0.09, 0.10, 
    0.06, 0.08, 0.07, 0.09, 0.08, 0.06, 0.05, 0.04
  ];

  const { totalTime, results } = useMemo(() => {
    try {
      return calculatePacing(stats.ftp, stats.wPrime, stats.weight, olhGrades);
    } catch (e) {
      console.error("Physics Error:", e);
      return { totalTime: 0, results: [] };
    }
  }, [stats]);

  const chartData = useMemo(() => {
    if (!results) return [];
    return results.map((r, i) => ({
      name: `${(i * 0.125).toFixed(2)}mi`,
      power: Math.round(r.targetP),
      wBal: Math.round(r.wBal),
      grade: parseFloat((r.grade * 100).toFixed(1))
    }));
  }, [results]);

  // Don't render anything until the client is ready
  if (!mounted) return <div className="p-8">Loading Pacer...</div>;

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto font-sans bg-slate-50 min-h-screen text-slate-900">
      <header className="mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight">OLH Pacer <span className="text-indigo-600">Pro</span></h1>
      </header>
      // Inside the return statement of PacerApp
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-lg font-bold">Pacing Strategy vs. Critical Power</h2>
          <span className="text-sm font-mono bg-slate-100 px-3 py-1 rounded-full text-slate-600">
            FTP: {stats.ftp}W
          </span>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData}>
              <defs>
                {/* This gradient creates the Red/Green split at exactly the FTP line */}
                <linearGradient id="splitColor" x1="0" y1="0" x2="0" y2="1">
                  <stop 
                    offset={1 - (stats.ftp / Math.max(...chartData.map(d => d.power), stats.ftp + 50))} 
                    stopColor="#ef4444" 
                    stopOpacity={0.6} 
                  />
                  <stop 
                    offset={1 - (stats.ftp / Math.max(...chartData.map(d => d.power), stats.ftp + 50))} 
                    stopColor="#22c55e" 
                    stopOpacity={0.6} 
                  />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" interval={3} />
              <YAxis 
                domain={['dataMin - 20', 'dataMax + 20']} 
                label={{ value: 'Watts', angle: -90, position: 'insideLeft' }} 
              />
              <Tooltip 
                 contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              
              {/* Reference Line for FTP */}
              <line 
                x1="0" y1={stats.ftp} x2="1000" y2={stats.ftp} 
                stroke="#475569" strokeDasharray="5 5" strokeWidth={2} 
              />
      
              {/* The Power Area */}
              <Area 
                type="stepAfter" 
                dataKey="power" 
                stroke="#4f46e5" 
                strokeWidth={3} 
                fill="url(#splitColor)" 
                name="Target Power" 
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div className="flex gap-4 mt-2 text-xs font-semibold uppercase tracking-wider">
           <div className="flex items-center gap-1 text-red-500"><span className="w-3 h-3 bg-red-500 rounded-sm"></span> Above CP (Depleting)</div>
           <div className="flex items-center gap-1 text-green-500"><span className="w-3 h-3 bg-green-500 rounded-sm"></span> Below CP (Recovering)</div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <label className="block text-xs font-bold uppercase text-slate-400 mb-2">FTP (Watts)</label>
          <input type="number" value={stats.ftp} onChange={e => setStats({...stats, ftp: Number(e.target.value)})} className="text-2xl font-mono w-full focus:outline-none text-indigo-600"/>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <label className="block text-xs font-bold uppercase text-slate-400 mb-2">W' (Joules)</label>
          <input type="number" value={stats.wPrime} onChange={e => setStats({...stats, wPrime: Number(e.target.value)})} className="text-2xl font-mono w-full focus:outline-none text-indigo-600"/>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <label className="block text-xs font-bold uppercase text-slate-400 mb-2">Weight (kg)</label>
          <input type="number" value={stats.weight} onChange={e => setStats({...stats, weight: Number(e.target.value)})} className="text-2xl font-mono w-full focus:outline-none text-indigo-600"/>
        </div>
      </div>

      {chartData.length > 0 ? (
        <div className="space-y-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold mb-4">Pacing Strategy (Est. {Math.floor(totalTime / 60)}m)</h2>
            <div style={{ width: '100%', height: 300, minHeight: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" interval={3} />
                  <YAxis yAxisId="left" />
                  <Tooltip />
                  <Area yAxisId="left" type="monotone" dataKey="power" fill="#6366f1" stroke="#6366f1" fillOpacity={0.1} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold mb-4">W' Balance</h2>
            <div style={{ width: '100%', height: 300, minHeight: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" interval={3} />
                  <YAxis domain={[0, 'dataMax + 1000']} />
                  <Tooltip />
                  <Area type="monotone" dataKey="wBal" fill="#f43f5e" stroke="#f43f5e" fillOpacity={0.1} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-20 text-center bg-white rounded-2xl border-2 border-dashed border-slate-200">
          No data calculated. Check physics engine.
        </div>
      )}
    </div>
  );
}
