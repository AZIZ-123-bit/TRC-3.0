import math

MUST_LAT = 35.8256
MUST_LON = 10.6369

GREEN_SPACES = [
    {"name":"Parc de la Corniche",      "type":"park",   "city":"Sousse",   "lat":35.8302,"lon":10.6391,"score":9.2,"amenities":["walking paths","sea view","benches"],"stress_reduction":22},
    {"name":"Jardin de Boujaffar",      "type":"garden", "city":"Sousse",   "lat":35.8271,"lon":10.6380,"score":8.7,"amenities":["flowers","shade","quiet"],"stress_reduction":18},
    {"name":"MUST Campus Green Zone",   "type":"campus", "city":"On campus","lat":35.8256,"lon":10.6369,"score":8.5,"amenities":["trees","study benches","wifi"],"stress_reduction":15},
    {"name":"Parc Ibn Khaldoun",        "type":"park",   "city":"Sousse",   "lat":35.8290,"lon":10.6340,"score":8.3,"amenities":["playground","trees","jogging"],"stress_reduction":18},
    {"name":"Médina Gardens",           "type":"garden", "city":"Sousse",   "lat":35.8270,"lon":10.6340,"score":8.0,"amenities":["historic","quiet","shade"],"stress_reduction":16},
    {"name":"Lac de Tunis North Shore", "type":"park",   "city":"Tunis",    "lat":36.8380,"lon":10.2350,"score":9.0,"amenities":["waterfront","cycling","picnic"],"stress_reduction":24},
    {"name":"Parc du Belvédère",        "type":"park",   "city":"Tunis",    "lat":36.8230,"lon":10.1680,"score":9.1,"amenities":["zoo","botanical garden","lake"],"stress_reduction":26},
    {"name":"Parc de l'Aghlabides",     "type":"park",   "city":"Kairouan", "lat":35.6781,"lon":10.0972,"score":9.0,"amenities":["historic","large","peaceful"],"stress_reduction":28},
    {"name":"Sebkhet Kelbia Reserve",   "type":"nature", "city":"Kairouan", "lat":35.8500,"lon":10.2000,"score":8.8,"amenities":["birdwatching","nature","quiet"],"stress_reduction":30},
    {"name":"Oasis de Tozeur",          "type":"oasis",  "city":"Tozeur",   "lat":33.9200,"lon":8.1200, "score":10.0,"amenities":["palms","streams","peace"],"stress_reduction":40},
    {"name":"Ain Draham Forest",        "type":"forest", "city":"Jendouba", "lat":36.7800,"lon":8.6900, "score":9.8,"amenities":["forest","cool air","hiking"],"stress_reduction":38},
    {"name":"Cap Bon Coastal Park",     "type":"park",   "city":"Nabeul",   "lat":36.4500,"lon":10.7500,"score":9.3,"amenities":["beach","cliffs","fresh air"],"stress_reduction":32},
]

PRESCRIPTIONS = {
    "Healthy":       {"message":"Your well-being looks good. A 20-min nature walk maintains your cortisol balance and sharpens focus for studying.","duration_min":20,"frequency":"3x/week"},
    "Moderate Risk": {"message":"Moderate stress detected. A 30-min walk in green space reduces cortisol by up to 20% and improves mood significantly.","duration_min":30,"frequency":"5x/week"},
    "High Risk":     {"message":"High stress indicators. Daily 45-min nature exposure is clinically proven to reduce anxiety. Prioritize this as treatment, not leisure.","duration_min":45,"frequency":"Daily"},
}

def haversine(lat1, lon1, lat2, lon2):
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
    return round(R * 2 * math.atan2(math.sqrt(a), math.sqrt(1-a)), 2)

def get_nearby_spaces(lat=MUST_LAT, lon=MUST_LON, limit=8):
    spaces = []
    for s in GREEN_SPACES:
        dist = haversine(lat, lon, s["lat"], s["lon"])
        walk_min = round(dist / 0.08) if dist < 5 else None  # 5km/h walking
        drive_min = round(dist / 0.6) if dist >= 5 else None  # 36km/h city driving
        spaces.append({**s, "distance_km": dist,
                        "walk_minutes": walk_min,
                        "drive_minutes": drive_min,
                        "transport": "walk" if dist < 5 else "drive"})
    return sorted(spaces, key=lambda x: x["distance_km"])[:limit]

def get_nature_prescription(lat=MUST_LAT, lon=MUST_LON, risk_label="Moderate Risk"):
    nearby = get_nearby_spaces(lat, lon, limit=1)
    nearest = nearby[0] if nearby else GREEN_SPACES[0]
    prescription = PRESCRIPTIONS.get(risk_label, PRESCRIPTIONS["Moderate Risk"])
    return {
        "risk_label": risk_label,
        "nearest_space": nearest["name"],
        "distance_km": nearest.get("distance_km", 0.8),
        "stress_reduction_pct": nearest["stress_reduction"],
        "recommended_duration_min": prescription["duration_min"],
        "frequency": prescription["frequency"],
        "message": prescription["message"],
        "science_note": "Source: Ulrich et al. (1991), Bratman et al. (2015) — peer-reviewed stress reduction via nature exposure."
    }
class MapsEngine:
    def get_nearby_spaces(self, lat=MUST_LAT, lon=MUST_LON, limit=8):
        return get_nearby_spaces(lat, lon, limit)

    def get_nature_prescription(self, lat=MUST_LAT, lon=MUST_LON, risk_label="Moderate Risk"):
        return get_nature_prescription(lat, lon, risk_label)
