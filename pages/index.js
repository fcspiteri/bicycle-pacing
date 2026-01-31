import { useState, useMemo } from 'react';
import { calculatePacing } from '../utils/physics';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

export default function PacerApp() {
  const [stats, setStats] = useState({ ftp: 280, wPrime: 18000, weight: 75 });
  const olhGrades = [0.04, 0.08, 0.08, 0.06, 0.07, 0.08, 0.07, 0.08, 0.09, 0.07, 0.08, 0.07, 0.07, 0.08, 0.09, 0.10, 0.06, 0.08, 0.07, 0.09, 0.08, 0.06, 0.05, 0.04];
  
  // Memoize calculation so it only runs when inputs change
  const { totalTime, results } = useMemo(() => 
    calculatePacing(stats.ftp, stats.wPrime, stats.weight, olhGrades), 
    [stats]
  );

  // Format data for the chart
  const chartData = results.map((r, i) => ({
    segment: i + 1,
    power: Math.round(r.targetP),
    wBal: Math.round(r.wBal),
    grade: (r.grade * 100).toFixed(1)
  }));

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto font-sans bg-slate-50 min-h-screen">
      <header className="mb-8">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">OLH Pacer <span className="text-indigo-600">Pro</span></h1>
        <p className="text-slate-500">Physics-based pacing for Old La Honda</p>
      </header>
      
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
          <label className="block text-xs font-bold uppercase text-slate-400 mb-2">System Weight (kg)</label>
          <input type="number" value={stats.weight} onChange={e => setStats({...stats, weight: +e.target.value})} className="text-2xl font-mono w-full focus:outline-none text-indigo-600"/>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8">
        <div className="flex justify-between items-end mb-4">
            <h2 className="text-lg font-bold text-slate-800">W' Depletion Profile</h2>
            <span className="text-sm font-medium text-slate-500">Est. Time: {Math.floor(totalTime / 60)}:{(totalTime % 60).toFixed(0).padStart(2, '0')}</span>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {/* W' Balance Chart */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8">
              <h2 className="text-lg font-bold text-slate-800 mb-4">W' Battery (Anaerobic Reserve)</h2>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorWBal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="segment" 
                      label={{ value: 'Distance (1/8mi segments)', position: 'insideBottom', offset: -5 }} 
                    />
                    <YAxis 
                      domain={[0, stats.wPrime]} 
                      label={{ value: 'Joules (J)', angle: -90, position: 'insideLeft' }} 
                    />
                    <Tooltip 
                      formatter={(value) => [`${value} J`, "W' Remaining"]}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="wBal" 
                      stroke="#ef4444" 
                      fillOpacity={1} 
                      fill="url(#colorWBal)" 
                      strokeWidth={3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs text-slate-400 mt-4 italic">
                Note: Red zones indicate where you are digging into your "matches." If this hits 0, you'll blow up!
              </p>
            </div>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Table section remains below... */}
    </div>
  );
}
