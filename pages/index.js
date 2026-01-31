import { useState } from 'react';
import { calculatePacing } from '../utils/physics';

export default function PacerApp() {
  const [stats, setStats] = useState({ ftp: 280, wPrime: 18000, weight: 75 });
  const olhGrades = [0.04, 0.08, 0.08, 0.06, 0.07, 0.08, 0.07, 0.08, 0.09, 0.07, 0.08, 0.07, 0.07, 0.08, 0.09, 0.10, 0.06, 0.08, 0.07, 0.09, 0.08, 0.06, 0.05, 0.04];
  
  const { totalTime, results } = calculatePacing(stats.ftp, stats.wPrime, stats.weight, olhGrades);

  return (
    <div className="p-8 max-w-4xl mx-auto font-sans bg-slate-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-slate-800">Old La Honda Pacer ⚡️</h1>
      
      <div className="grid grid-cols-3 gap-4 mb-8 bg-white p-6 rounded-xl shadow-sm">
        <div>
          <label className="block text-sm font-medium">FTP (Watts)</label>
          <input type="number" value={stats.ftp} onChange={e => setStats({...stats, ftp: +e.target.value})} className="border p-2 rounded w-full"/>
        </div>
        <div>
          <label className="block text-sm font-medium">W' (Joules)</label>
          <input type="number" value={stats.wPrime} onChange={e => setStats({...stats, wPrime: +e.target.value})} className="border p-2 rounded w-full"/>
        </div>
        <div>
          <label className="block text-sm font-medium">Weight (kg)</label>
          <input type="number" value={stats.weight} onChange={e => setStats({...stats, weight: +e.target.value})} className="border p-2 rounded w-full"/>
        </div>
      </div>

      <div className="mb-4 text-xl font-semibold text-indigo-600">
        Projected Time: {Math.floor(totalTime / 60)}m {Math.floor(totalTime % 60)}s
      </div>

      <div className="overflow-x-auto bg-white rounded-xl shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-4">Seg</th>
              <th className="p-4">Grade</th>
              <th className="p-4">Target Power</th>
              <th className="p-4">W' Bal</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r, i) => (
              <tr key={i} className="border-t">
                <td className="p-4">{i + 1}</td>
                <td className="p-4">{(r.grade * 100).toFixed(1)}%</td>
                <td className={`p-4 font-mono ${r.targetP > stats.ftp ? 'text-red-500' : 'text-green-600'}`}>
                  {r.targetP.toFixed(0)}W
                </td>
                <td className="p-4 font-mono">{Math.max(0, r.wBal).toFixed(0)}J</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
