import sys
import json
from ucitavacBaze import get_supabase_client, dohvati_lokacije, dohvati_graf
from algoritmi import a_star_search, bfs_search, ucs_search
from dotenv import load_dotenv

load_dotenv()


def main():
    if len(sys.argv) < 4:
        print(json.dumps({"status": "error", "message": "Nedostaju argumenti"}))
        return

    start_id = sys.argv[1]
    end_id = sys.argv[2]
    odabrani_alg = sys.argv[3].lower()  # 'astar', 'bfs' ili 'ucs'

    try:
        client = get_supabase_client()
        lokacije = dohvati_lokacije(client)
        graf = dohvati_graf(client)

        if odabrani_alg == "astar":
            putanja_ids, cijena, posjeceno = a_star_search(
                start_id, end_id, graf, lokacije
            )
        elif odabrani_alg == "bfs":
            putanja_ids, cijena, posjeceno = bfs_search(start_id, end_id, graf)
        elif odabrani_alg == "ucs":
            putanja_ids, cijena, posjeceno = ucs_search(start_id, end_id, graf)
        else:
            print(
                json.dumps(
                    {
                        "status": "error",
                        "message": f"Nepoznat algoritam: {odabrani_alg}",
                    }
                )
            )
            return

        if putanja_ids:
            detaljna_putanja = []
            for s_id in putanja_ids:
                if s_id in lokacije:
                    podaci = lokacije[s_id]
                    detaljna_putanja.append(
                        {
                            "stop_id": s_id,
                            "stop_name": podaci["name"],
                            "lat": podaci["lat"],
                            "lon": podaci["lon"],
                        }
                    )

            print(
                json.dumps(
                    {
                        "status": "success",
                        "algoritam": odabrani_alg,
                        "putanja": detaljna_putanja,
                        "trajanje": cijena,
                        "posjeceno": posjeceno,
                    }
                )
            )
        else:
            print(json.dumps({"status": "error", "message": "Put nije pronađen"}))

    except Exception as e:
        print(json.dumps({"status": "error", "message": str(e)}))


if __name__ == "__main__":
    main()
