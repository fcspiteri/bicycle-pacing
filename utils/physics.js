export function calculatePacing(ftp, wPrime, weight, segments) {
  const bikeWeight = 8;
  const totalMass = weight + bikeWeight;
  const segmentMeters = 0.125 * 1609.34;
  const g = 9.81, crr = 0.005, rho = 1.225, cda = 0.38, efficiency = 0.96;
  const windMs = 1.78; // ~4mph headwind constant

  // 1. Optimization Loop
  let low = 0.7, high = 1.4;
  for (let i = 0; i < 15; i++) {
    let mid = (low + high) / 2;
    let wBalTemp = wPrime;
    let blownUp = false;

    for (const segGrade of segments) {
      // Dynamic Scaling: Ride harder on climbs, easier on flats
      // This pivot (0.072) helps create the Green/Red split
      let targetP = ftp * (1.0 + (segGrade - 0.072) * 2.0) * mid;
      let v = 3.5;
      for (let j = 0; j < 7; j++) {
        let fGrav = totalMass * g * segGrade;
        let fRoll = totalMass * g * crr;
        let fDrag = 0.5 * rho * Math.pow(v + windMs, 2) * cda;
        v = (targetP * efficiency) / (fGrav + fRoll + fDrag);
      }
      let t = segmentMeters / v;
      if (targetP > ftp) wBalTemp -= (targetP - ftp) * t;
      else wBalTemp += (wPrime - wBalTemp) * (1 - Math.exp(-t / 300));
      
      if (wBalTemp <= 0) { blownUp = true; break; }
    }
    if (!blownUp && wBalTemp > 100) low = mid;
    else high = mid;
  }

  // 2. Final Pass
  let currentWBal = wPrime;
  let totalTime = 0;
  const results = segments.map((grade) => {
    let targetP = ftp * (1.0 + (grade - 0.072) * 2.0) * low;
    let v = 3.5;
    for (let j = 0; j < 7; j++) {
      let fGrav = totalMass * g * grade;
      let fRoll = totalMass * g * crr;
      let fDrag = 0.5 * rho * Math.pow(v + windMs, 2) * cda;
      v = (targetP * efficiency) / (fGrav + fRoll + fDrag);
    }
    let t = segmentMeters / v;
    totalTime += t;
    if (targetP > ftp) currentWBal -= (targetP - ftp) * t;
    else currentWBal += (wPrime - currentWBal) * (1 - Math.exp(-t / 300));

    return { grade, targetP, wBal: Math.max(0, currentWBal), speed: v * 2.237 };
  });

  return { totalTime, results };
}
