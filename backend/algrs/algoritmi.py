import heapq

def jednostavna_heuristika(s1,s2,lokacije):
    lat1, lon1, _ = lokacije[s1]
    lat2, lon2, _ = lokacije[s2]

    d_lat = lat1 -lat2
    d_lon = lon1 - lon2

    metri_lat = d_lat*111000
    metri_lon = d_lon*111000 *0.7

    udaljenost_metri = (metri_lat**2 + metri_lon**2)**0.5

    return udaljenost_metri/11

def rekonstruiraj_put(roditelj, n):
    putanja = []
    while n is not None:
        putanja.append(n)
        n = roditelj[n][0]
    return putanja[::-1]

def a_star_search(start_node, goal_node, succ, lokacije):
    h_start = jednostavna_heuristika(start_node, goal_node, lokacije)
    open_set = [(h_start, start_node, 0)]
    
    roditelj = {start_node: (None, 0, 0)}
    closed = set()
    brojac_posjecenih = 0

    while open_set:
        f_n, n, g_n = heapq.heappop(open_set)

        if n == goal_node:
            return rekonstruiraj_put(roditelj, n), g_n, brojac_posjecenih

        #if n in closed:
            #continue
            
        closed.add(n)
        brojac_posjecenih += 1

        for susjed, trajanje in succ.get(n, []):
            nova_g_cijena = g_n + trajanje
            
            if susjed not in roditelj or nova_g_cijena < roditelj[susjed][2]:
                roditelj[susjed] = (n, trajanje, nova_g_cijena)
                h_n = jednostavna_heuristika(susjed, goal_node, lokacije)
                f_n_susjed = nova_g_cijena + h_n
                heapq.heappush(open_set, (f_n_susjed, susjed, nova_g_cijena))

    return None, float('inf'), brojac_posjecenih