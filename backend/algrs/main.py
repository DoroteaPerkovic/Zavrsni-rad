import sys
import json
from ucitavacBaze import get_supabase_client, dohvati_lokacije, dohvati_graf
from algoritmi import a_star_search
from dotenv import load_dotenv

load_dotenv()

def main():
    if len(sys.argv) < 3:
        print(json.dumps({"status": "error", "message": "Nedostaju argumenti"}))
        return

    start_id = sys.argv[1]
    end_id = sys.argv[2]

    try:
        client = get_supabase_client()
        lokacije = dohvati_lokacije(client)
        graf = dohvati_graf(client)

        putanja_ids, cijena, posjeceno = a_star_search(start_id, end_id, graf, lokacije)

        if putanja_ids:
            detaljna_putanja = []
            for s_id in putanja_ids:
                if s_id in lokacije:
                    lat, lon, ime = lokacije[s_id]
                    detaljna_putanja.append({
                        "stop_id": s_id,
                        "stop_name": ime,
                        "lat": lat,
                        "lon": lon
                    })

            print(json.dumps({
                "status": "success",
                "putanja": detaljna_putanja,
                "trajanje": cijena,
                "posjeceno": posjeceno
            }))
        else:
            print(json.dumps({"status": "error", "message": "Put nije pronađen"}))

    except Exception as e:
        print(json.dumps({"status": "error", "message": str(e)}))

if __name__ == "__main__":
    main()