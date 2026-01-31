import math

def simulate_climb_final(ftp, w_prime, segments, body_weight, bike_weight, intensity_factor, headwind_mph):
    w_bal = w_prime
    total_time = 0
    total_mass = body_weight + bike_weight
    segment_miles = 0.125
    segment_meters = segment_miles * 1609.34
    
    # Physics & Reality Constants
    g, crr, rho = 9.81, 0.005, 1.225
    cda = 0.38        # Typical hoods climbing position
    efficiency = 0.96 # 4% drivetrain/bearing loss
    wind_ms = headwind_mph * 0.44704
    
    results = []

    for grade in segments:
        # Pacing Strategy: Higher intensity on steeper sections
        target_p = ftp * (1.0 + (grade - 0.075) * 2) * intensity_factor
        p_wheels = target_p * efficiency
        
        # Iterative solver for ground speed (v)
        v = 3.5 
        for _ in range(7):
            f_gravity = total_mass * g * grade
            f_rolling = total_mass * g * crr
            f_drag = 0.5 * rho * ((v + wind_ms)**2) * cda
            v = p_wheels / (f_gravity + f_rolling + f_drag)
        
        time_seconds = segment_meters / v
        total_time += time_seconds
        
        # W' Balance
        if target_p > ftp:
            w_bal -= (target_p - ftp) * time_seconds
        else:
            w_bal += (w_prime - w_bal) * (1 - math.exp(-time_seconds / 300))
            
        results.append((grade, target_p, w_bal, v))
        
    return total_time, w_bal, results

def get_pacing_plan(ftp, w_prime, body_weight, bike_weight, headwind):
    olh_grades = [
        0.04, 0.08, 0.08, 0.06, 0.07, 0.08, 0.07, 0.08, # 0.0 - 1.0 mi
        0.09, 0.07, 0.08, 0.07, 0.07, 0.08, 0.09, 0.10, # 1.0 - 2.0 mi
        0.06, 0.08, 0.07, 0.09, 0.08, 0.06, 0.05, 0.04  # 2.0 - 3.0 mi
    ]
    
    # Optimization loop
    low, high = 0.7, 1.5
    for _ in range(15):
        mid = (low + high) / 2
        _, final_w, _ = simulate_climb_final(ftp, w_prime, olh_grades, body_weight, bike_weight, mid, headwind)
        if final_w > 0: low = mid
        else: high = mid
            
    final_time, _, data = simulate_climb_final(ftp, w_prime, olh_grades, body_weight, bike_weight, low, headwind)
    
    print(f"--- THE FINAL VIBE: OLH PACING PLAN ---")
    print(f"Total Time: {int(final_time//60)}m {int(final_time%60)}s")
    print(f"Average Power: {sum(d[1] for d in data)/len(data):.1f}W\n")
    print("| Seg | Dist (mi) | Grade | Target Pwr | Speed (mph) | W' Bal (J) |")
    print("|-----|-----------|-------|------------|-------------|------------|")
    
    for i, (g, p, w, v) in enumerate(data):
        dist = (i + 1) * 0.125
        print(f"| {i+1:2}  | {dist:8.3f}  | {g:>5.1%} | {p:9.1f}W | {v*2.237:11.1f} | {max(0, int(w)):10} |")

# Set your stats here
get_pacing_plan(ftp=280, w_prime=13000, body_weight=68, bike_weight=8, headwind=4)
