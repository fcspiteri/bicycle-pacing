import { useState, useMemo, useEffect } from 'react';
import { calculatePacing } from '../utils/physics';
import { Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, ComposedChart } from 'recharts';

export default function PacerApp() {
  const [stats, setStats] = useState({ ftp: 280, wPrime: 18000, weight: 75 });
  const [isMounted, setIsMounted] = useState(false);

  // Old La Honda segment grades (1/8th mile intervals)
  const olhGrades = [
    0.04, 0.08, 0.08, 0.06, 0.07, 0.08, 0.07, 0.08, 
    0.09, 0.07, 0.08, 0.07, 0.07, 0.08, 0.09, 0.10, 
    0.06, 0.08, 0.07, 0.09, 0.08, 0.06, 0.05, 0.04
  ];

  // Fix for Next.js hydration: only render charts on the client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { totalTime, results } = useMemo(() => 
    calculatePacing(stats.ftp, stats.wPrime, stats.weight, olhGrades), 
    [stats]
  );

  const chartData = useMemo(() => {
    return results.map((r, i) => ({
      segment: (i * 0.125).toFixed(2),
      power: Math.round(r.targetP),
      wBal: Math.round(r.wBal),
      grade: (r.grade * 100).toFixed(1)
    }));
  }, [results]);

  if (!isMounted) return null;

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto font-sans bg-slate-50 min-h-screen text-slate-900">
      <header className="mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight">OLH Pacer <span className="text-indigo-600">Pro</span></h1>
        <p className="text-slate-500 font-medium">Physics-based pacing for the Old La Honda climb</p>
      </header>
      
      {/* Input Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <label className="block text-xs font-bold uppercase text-slate-400 mb-2">FTP (Watts)</label>
          <input type="number" value={stats.ftp} onChange={e => setStats({...stats, ftp: +e.target.value})} className="text-2xl font-mono w-full focus:outline-none text-indigo-600"/>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <label className="block text-xs font-bold uppercase text-slate-400 mb-2">W' (Joules)</label>
          <input type="number" value={stats.wPrime} onChange={e => setStats({...stats, wPrime: +e.target.value})} className="text-2xl font-mono w-full focus:outline-none text-indigo-600"/>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <label className="block text-xs font-bold uppercase text-slate-400 mb-2">Weight (System kg)</label>
          <input type="number" value={stats.weight} onChange={e => setStats({...stats, weight: +e.target.value})} className="text-2xl font-mono w-full focus:outline-none text-indigo-600"/>
        </div>
      </div>

      <div className="space-y-8">
        {/* Power vs Grade Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-lg font-bold">Power Strategy</h2>
            <span className="text-sm font-mono bg-slate-100 px-3 py-1 rounded-full text-slate-600">
              Est. Time: {Math.floor(totalTime / 60)}:{(totalTime % 60).toFixed(0).padStart(2, '0')}
            </span>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="segment" label={{ value: 'Miles', position: 'insideBottom', offset: -5 }} />
                <YAxis yAxisId="left" orientation="left" stroke="#6366f1" label={{ value: 'Watts', angle: -90, position: 'insideLeft' }} />
                <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" label={{ value: 'Grade %', angle: 90, position: 'insideRight' }} />
                <Tooltip />
                <Area yAxisId="right" type="step" dataKey="grade" fill="#f1f5f9" stroke="#cbd5e1" name="Grade %" />
                <Line yAxisId="left" type="stepAfter" dataKey="power" stroke="#6366f1" strokeWidth={3} dot={false} name="Target Power" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* W' Depletion Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold mb-6">W' Battery Remaining</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorW" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="segment" />
                <YAxis domain={[0, stats.wPrime]} label={{ value: 'Joules', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Area type="monotone" dataKey="wBal" stroke="#f43f5e" fillOpacity={1} fill="url(#colorW)" strokeWidth={3} name="W' Balance" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <footer className="mt-12 text-center text-slate-400 text-sm">
        <p>Built for the climb. Push the limits.</p>
      </footer>
    </div>
  );
}
