import heapq
from collections import deque

def jednostavna_heuristika(s1,s2,lokacije):
    if s1 not in lokacije or s2 not in lokacije:
        return 0
    
    podaci1 = lokacije[s1]
    podaci2 = lokacije[s2]
    
    lat1 = float(podaci1["lat"])
    lon1 = float(podaci1["lon"])
    lat2 = float(podaci2["lat"])
    lon2 = float(podaci2["lon"])

    d_lat = lat1 - lat2
    d_lon = lon1 - lon2

    #pretvorba u metre
    metri_lat = d_lat*111000
    metri_lon = d_lon*111000 *0.7

    udaljenost_metri = (metri_lat**2 + metri_lon**2)**0.5

    #pretpostavljam brzinu od 11m/s  -> mozda promijeni kasnije!
    return udaljenost_metri/11

def rekonstruiraj_put(roditelj, n):
    putanja = []
    while n is not None:
        putanja.append(n)
        n = roditelj[n][0]
    return putanja[::-1]


def bfs_search(start_node, goal_node, succ):    
    queue = deque([(start_node, None)])
    roditelj = {start_node: (None, 0, 0)}
    visited = {start_node}
    brojac_posjecenih = 0

    while queue:
        n, linija_dolaska = queue.popleft()
        brojac_posjecenih += 1

        if n == goal_node:
            return rekonstruiraj_put(roditelj, n), roditelj[n][2], brojac_posjecenih

        for susjed, trajanje, udaljenost , linija in succ.get(n, []):
            if susjed not in visited:
                visited.add(susjed)
                trosak_skoka = 1

                if linija_dolaska is not None and linija_dolaska != linija:
                    trosak_skoka +=1 #kazna za presjedanje

                nova_g = roditelj[n][2] + trosak_skoka
                roditelj[susjed] = (n, linija, nova_g)  
                queue.append((susjed, linija))

    return None, float('inf'), brojac_posjecenih

def ucs_search(start_node, goal_node, succ):
    open_set = [(0, start_node, None)]
    roditelj = {start_node: (None, 0, 0)}
    closed = set()
    brojac_posjecenih = 0

    while open_set:
        g_n, n, linija_dolaska = heapq.heappop(open_set)

        if n == goal_node:
            return rekonstruiraj_put(roditelj, n), g_n, brojac_posjecenih

        if n in closed:
            continue
        
        closed.add(n)
        brojac_posjecenih += 1

        for susjed, trajanje, udaljenost, linija in succ.get(n, []):
            dodatni_trosak = 0

            if linija_dolaska is not None and linija_dolaska != linija:
                dodatni_trosak =100
            
            nova_g_cijena = g_n + trajanje + dodatni_trosak
            
            if susjed not in roditelj or nova_g_cijena < roditelj[susjed][2]:
                roditelj[susjed] = (n, linija, nova_g_cijena)  
                heapq.heappush(open_set, (nova_g_cijena, susjed, linija))

    return None, float('inf'), brojac_posjecenih

def a_star_search(start_node, goal_node, succ, lokacije):
    h_start = jednostavna_heuristika(start_node, goal_node, lokacije)
    open_set = [(h_start, start_node, 0, None)]
    
    roditelj = {start_node: (None, 0, 0, None)}
    closed = set()
    brojac_posjecenih = 0

    while open_set:
        f_n, n, g_n, linija_dolaska = heapq.heappop(open_set)

        if n == goal_node:
            return rekonstruiraj_put(roditelj, n), g_n, brojac_posjecenih

        #if n in closed:
            #continue
            
        closed.add(n)
        brojac_posjecenih += 1

        for susjed, trajanje, udaljenost, linija in succ.get(n, []):
            dodatni_trosak = trajanje
            
            if linija_dolaska is not None and linija_dolaska != linija:
                dodatni_trosak +=100  # 100sek je mozda premalo, sto je vrijeme manje algoritam ce vise preferirati presjedanje

            nova_g_cijena = g_n + dodatni_trosak

            if susjed not in roditelj or nova_g_cijena < roditelj[susjed][2]:
                roditelj[susjed] = (n, dodatni_trosak, nova_g_cijena, linija)
                h_n = jednostavna_heuristika(susjed, goal_node, lokacije)
                f_n_susjed = nova_g_cijena + h_n
                heapq.heappush(open_set, (f_n_susjed, susjed, nova_g_cijena, linija))

    return None, float('inf'), brojac_posjecenih