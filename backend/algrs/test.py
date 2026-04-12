from ucitavacBaze import get_supabase_client, dohvati_lokacije, dohvati_graf
from dotenv import load_dotenv

load_dotenv()

def testiraj():
    client = get_supabase_client()

    print("--- Testiranje učitavanja lokacija ---")
    lokacije = dohvati_lokacije(client)
    print(f"Ukupno učitano stanica: {len(lokacije)}")
    
    # Ispiši prve 3 stanice da vidiš format
    uzorak_id = list(lokacije.keys())[:3]
    for kid in uzorak_id:
        print(f"ID: {kid} -> Podaci: {lokacije[kid]}")

    print("\n--- Testiranje izgradnje grafa ---")
    succ = dohvati_graf(client)
    print(f"Broj čvorova u grafu: {len(succ)}")
    
    # Provjeri nasumičnu stanicu i njezine susjede
    if succ:
        uzorak_izvor = list(succ.keys())[0]
        print(f"Stanica {uzorak_izvor} vodi do: {succ[uzorak_izvor]}")

if __name__ == "__main__":
    testiraj()