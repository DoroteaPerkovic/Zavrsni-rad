import os
from supabase import create_client

def get_supabase_client():
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_KEY")
    return create_client(url, key)

def dohvati_lokacije(supabase):
    tram_stanice = supabase.table("tram_stops").select("stop_id, stop_name, stop_lat, stop_lon").execute()
    bus_stanice = supabase.table("bus_stops").select("stop_id, stop_name, stop_lat, stop_lon").execute()
    sve_stanice = tram_stanice.data + bus_stanice.data

    lokacije = {}
    for s in sve_stanice:
        sid = str(s["stop_id"])
        lokacije[sid] = {
            "lat": float(s["stop_lat"]),
            "lon": float(s["stop_lon"]),
            "name": s["stop_name"]
        }
    return lokacije

def dohvati_graf(supabase):
    odgovor = supabase.table("mreza_veza").select("source_stop, target_stop, duration_sec, distance_m, linija_ime").limit(100000).execute()
    succ = {}
    for red in odgovor.data:
        s1,s2 = str(red["source_stop"]).strip(), str(red["target_stop"]).strip()
        trajanje = float(red["duration_sec"] or 0)
        udaljenost = float(red["distance_m"] or 0)
        linija = red["linija_ime"]

        if s1 not in succ:
            succ[s1] = []
        succ[s1].append((s2, max(trajanje,1.0), udaljenost, linija))
    return succ