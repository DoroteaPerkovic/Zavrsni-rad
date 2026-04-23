import os
import sys
import json
import pandas as pd
import networkx as nx
from dotenv import load_dotenv
from supabase import create_client

# 1. Funkcije
def hms_u_sekunde(vrijeme_str):
    if not vrijeme_str:
        return 0
    h, m, s = map(int, vrijeme_str.split(':'))
    return h * 3600 + m * 60 + s

# 2. Inicijalizacija
load_dotenv()
url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")
supabase = create_client(url, key)

def main():
    # Uzimamo start i end iz argumenata koje šalje Express
    # npr. python algoritmi.py 264_2 115_4
    if len(sys.argv) < 3:
        print(json.dumps({"error": "Nedostaju start_id ili end_id"}))
        return

    start_node = sys.argv[1]
    end_node = sys.argv[2]

    # 3. Dohvaćanje podataka
    # Povećao sam limit na 10000 jer 5000 često nije dovoljno za cijeli grad
    response = supabase.table("stop_times").select("trip_id, stop_id, stop_sequence, arrival_time, departure_time").limit(10000).execute()
    data = response.data

    if not data:
        print(json.dumps({"error": "Nema podataka u bazi"}))
        return

    df_st = pd.DataFrame(data)
    df_st = df_st.sort_values(['trip_id', 'stop_sequence'])

    # 4. Izgradnja grafa
    G = nx.DiGraph()
    for i in range(len(df_st) - 1):
        row1 = df_st.iloc[i]
        row2 = df_st.iloc[i+1]
        if row1['trip_id'] == row2['trip_id']:
            t1 = hms_u_sekunde(row1['departure_time'])
            t2 = hms_u_sekunde(row2['arrival_time'])
            trajanje = max(t2 - t1, 1) 
            G.add_edge(str(row1['stop_id']), str(row2['stop_id']), weight=trajanje)

    # 5. Izračun rute
    try:
        put_ids = nx.dijkstra_path(G, source=start_node, target=end_node, weight='weight')
        ukupno_sekundi = nx.dijkstra_path_length(G, source=start_node, target=end_node, weight='weight')

        # 6. Dohvaćanje detalja o stanicama (za frontend kartu)
        res_stops = supabase.table("stops").select("stop_id, stop_name, stop_lat, stop_lon").in_("stop_id", put_ids).execute()
        stops_info = {str(s['stop_id']): s for s in res_stops.data}

        # Slažemo finalni odgovor u ispravnom redoslijedu rute
        finalna_ruta = []
        for s_id in put_ids:
            info = stops_info.get(s_id, {"stop_name": "Nepoznato", "stop_lat": 0, "stop_lon": 0})
            finalna_ruta.append({
                "stop_id": s_id,
                "name": info['stop_name'],
                "lat": info['stop_lat'],
                "lon": info['stop_lon']
            })

        # Ispisujemo samo JSON (ovo hvata Express)
        print(json.dumps({
            "status": "success",
            "trajanje_min": ukupno_sekundi // 60,
            "putanja": finalna_ruta
        }))

    except nx.NetworkXNoPath:
        print(json.dumps({"status": "error", "message": "Nema putanje"}))
    except nx.NodeNotFound as e:
        print(json.dumps({"status": "error", "message": f"Čvor nije nađen: {str(e)}"}))

if __name__ == "__main__":
    main()