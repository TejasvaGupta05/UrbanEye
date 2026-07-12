import json
import random
import time

def generate_mock_data():
    """Generates fake civic issue reports around Delhi for demo purposes"""
    
    # Delhi center (Connaught Place area)
    base_lat = 28.6139
    base_lng = 77.2090
    
    reports = []
    
    # Advanced Delhi-specific problems
    issues_list = [
        {'category': 'pothole', 'desc': 'Severe pothole causing traffic slowdown near metro station'},
        {'category': 'garbage', 'desc': 'Overflowing dhalao (garbage dump) blocking sidewalk'},
        {'category': 'traffic_signal', 'desc': 'Signal malfunction causing gridlock'},
        {'category': 'waterlogging', 'desc': 'Water stagnation under flyover due to blocked drain'},
        {'category': 'construction_waste', 'desc': 'Illegal dumping of malba (construction debris) on road'},
        {'category': 'pollution', 'desc': 'Open waste burning contributing to smog'},
        {'category': 'encroachment', 'desc': 'Illegal hawkers occupying entire footpath'},
        {'category': 'streetlight', 'desc': 'Dark spot: Street lights not working on main road'}
    ]
    
    # Generate 150 random reports for a "dense" city feel
    for _ in range(150):
        # Random offset (approx 10-15km radius covering NCR)
        lat_offset = random.uniform(-0.1, 0.1)
        lng_offset = random.uniform(-0.1, 0.1)
        
        issue = random.choice(issues_list)
        
        report = {
            "timestamp": int(time.time()) - random.randint(0, 86400 * 3), # Last 3 days
            "issues": [
                {
                    "category": issue['category'],
                    "severity": random.choice(['medium', 'high', 'critical']),
                    "description": issue['desc']
                }
            ],
            "latitude": base_lat + lat_offset,
            "longitude": base_lng + lng_offset,
            "count": random.randint(1, 5) # Simulate multiple reports for same issue
        }
        reports.append(report)
        
    # Save to reports.json
    with open('reports.json', 'w') as f:
        json.dump(reports, f, indent=2)
        
    print(f"✅ Generated {len(reports)} mock reports for Delhi in reports.json")

if __name__ == "__main__":
    generate_mock_data()
