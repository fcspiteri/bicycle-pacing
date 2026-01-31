import React, { useState, useMemo, useEffect } from 'react';
import { calculatePacing } from '../utils/physics';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from 'recharts';

export default function PacerApp() {
  const [stats, setStats] = useState({ ftp: 280, wPrime: 15000, weight: 75 });
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
    return calculatePacing(stats.ftp, stats.wPrime, stats.weight, olhGrades);
  }, [stats]);

  const chartData = useMemo(() => {
    if (!results || results.length === 0) return [];
    return results.map((r, i) => ({
      dist: (i * 0.125).toFixed(2),
      power: Math.round(r.targetP),
      wBal: Math.round(r.wBal)
    }));
  }, [results]);

  if (!mounted) return <div style={{padding: '50px', textAlign: 'center'}}>Loading...</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1>OLH PACER</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '20px' }}>
        <div>
          <label>FTP</label><br/>
          <input type="number" value={stats.ftp} onChange={e => setStats({...stats, ftp: +e.target.value})} />
        </div>
        <div>
          <label>W'</label><br/>
          <input type="number" value={stats.wPrime} onChange={e => setStats({...stats, wPrime: +e.target.value})} />
        </div>
        <div>
          <label>Weight</label><br/>
          <input type="number" value={stats.weight} onChange={e => setStats({...stats, weight: +e.target.value})} />
        </div>
      </div>

      <div style={{ background: 'white', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h3>Pacing (Watts) - Time: {Math.floor(totalTime / 60)}:{(totalTime % 60).toFixed(0).padStart(2, '0')}</h3>
        
        {/* WE USE A FIXED HEIGHT DIV INSTEAD OF TAILWIND CLASSES */}
        <div style={{ width: '100%', height: '300px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="dist" />
              <YAxis domain={['auto', 'auto']} />
              <Tooltip />
              <Area type="stepAfter" dataKey="power" stroke="#8884d8" fill="#8884d8" isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ marginTop: '20px', background: 'white', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h3>W' Balance</h3>
        <div style={{ width: '100%', height: '200px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="dist" hide />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="wBal" stroke="#ff0000" fill="#ff0000" fillOpacity={0.1} isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
