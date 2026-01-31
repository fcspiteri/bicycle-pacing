export function calculatePacing(ftp, wPrime, bodyWeight, segments) {
  let wBal = wPrime;
  let totalTime = 0;
  const bikeWeight = 8; // default
  const totalMass = bodyWeight + bikeWeight;
  const segmentMeters = 0.125 * 1609.34;
  
  const g = 9.81, crr = 0.005, rho = 1.225, cda = 0.38, efficiency = 0.96;
  const windMs = 4 * 0.44704; // 4mph headwind default
  
  // 1. Optimization Loop (Binary Search for Intensity Factor)
  let low = 0.7, high = 1.5, intensityFactor = 1.0;
  
  for (let j = 0; j < 15; j++) {
    intensityFactor = (low + high) / 2;
    let tempWBal = wPrime;
    
    for (const grade of segments) {
      const targetP = ftp * (1.0 + (grade - 0.075) * 2) * intensityFactor;
      const pWheels = targetP * efficiency;
      let v = 3.5;
      for (let k = 0; k < 7; k++) {
        const fGravity = totalMass * g * grade;
        const fRolling = totalMass * g * crr;
        const fDrag = 0.5 * rho * Math.pow((v + windMs), 2) * cda;
        v = pWheels / (fGravity + fRolling + fDrag);
      }
      const timeSec = segmentMeters / v;
      if (targetP > ftp) {
        tempWBal -= (targetP - ftp) * timeSec;
      } else {
        tempWBal += (wPrime - tempWBal) * (1 - Math.exp(-timeSec / 300));
      }
    }
    if (tempWBal > 0) low = intensityFactor;
    else high = intensityFactor;
  }

  // 2. Final Run with optimized intensity
  const results = [];
  wBal = wPrime;
  totalTime = 0;

  segments.forEach((grade) => {
    const targetP = ftp * (1.0 + (grade - 0.075) * 2) * low;
    const pWheels = targetP * efficiency;
    let v = 3.5;
    for (let k = 0; k < 7; k++) {
      const fGravity = totalMass * g * grade;
      const fRolling = totalMass * g * crr;
      const fDrag = 0.5 * rho * Math.pow((v + windMs), 2) * cda;
      v = pWheels / (fGravity + fRolling + fDrag);
    }
    const timeSec = segmentMeters / v;
    totalTime += timeSec;
    
    if (targetP > ftp) {
      wBal -= (targetP - ftp) * timeSec;
    } else {
      wBal += (wPrime - wBal) * (1 - Math.exp(-timeSec / 300));
    }

    results.append({ grade, targetP, wBal, v });
  });

  return { totalTime, results };
}
