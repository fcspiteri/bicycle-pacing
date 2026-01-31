export function calculatePacing(ftp, wPrime, weight, segments) {
  const bikeWeight = 8;
  const totalMass = weight + bikeWeight;
  const segmentMeters = 0.125 * 1609.34;
  const g = 9.81, crr = 0.005, rho = 1.225, cda = 0.38, efficiency = 0.96;
  const windMs = 4 * 0.44704;

  // 1. Optimization Loop (Binary Search)
  let low = 0.7, high = 1.3; // Narrower range for stability
  for (let i = 0; i < 15; i++) {
    let mid = (low + high) / 2;
    let wBalTemp = wPrime;
    let blownUp = false;
  
    for (const segmentGrade of segments) {
      // Smoother pacing: Reduce the multiplier from 2 to 1.5
      let targetP = ftp * (1.0 + (segmentGrade - 0.072) * 2.5) * mid;
      
      // Physics for speed (same as before)
      let v = 3.5;
      for (let j = 0; j < 7; j++) {
        let fGrav = totalMass * 9.81 * segmentGrade;
        let fRoll = totalMass * 9.81 * 0.005;
        let fDrag = 0.5 * 1.225 * Math.pow(v + 1.78, 2) * 0.38;
        v = (targetP * 0.96) / (fGrav + fRoll + fDrag);
      }
      let t = (0.125 * 1609.34) / v;
  
      if (targetP > ftp) {
        wBalTemp -= (targetP - ftp) * t;
      } else {
        wBalTemp += (wPrime - wBalTemp) * (1 - Math.exp(-t / 300));
      }
  
      if (wBalTemp <= 0) {
        blownUp = true;
        break;
      }
    }
  
    // Aim to finish with a tiny bit of reserve (e.g., 200 Joules) instead of exactly 0
    if (!blownUp && wBalTemp > 200) low = mid; 
    else high = mid;
  }
  // 2. Final Results Pass
  let currentWBal = wPrime;
  let totalTime = 0;
  
  const results = segments.map((grade) => { // 'grade' is defined here for each segment
    let targetP = ftp * (1.0 + (grade - 0.075) * 2) * low;
    let v = 3.5;
    // Ensure 'grade' is used correctly inside this calculation block
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
    
    return { 
        grade, 
        targetP, 
        wBal: Math.max(0, currentWBal), 
        speed: v * 2.237 
    };
  });

  return { totalTime, results };
}
