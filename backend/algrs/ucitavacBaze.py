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

    lokacije = {
        str(s["stop_id"]): (float(s["stop_lat"]), float(s["stop_lon"]), s["stop_name"])
        for s in sve_stanice
    }
    return lokacije

def dohvati_graf(supabase):
    odgovor = supabase.table("graph_edges_view").select("source, target, duration").execute()
    succ = {}
    for red in odgovor.data:
        s1,s2 = str(red["source"]), str(red["target"])
        trajanje = float(red["duration"])

        if s1 not in succ:
            succ[s1] = []
        succ[s1].append((s2, max(trajanje,1.0)))
    return succ