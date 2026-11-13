# PROGRESSION_SYSTEM — Économie, déblocages, badges

> Statut : **proposition Phase 1 — à valider**. Auteur : Agent 4 (Monetization & Game Economy).
> Tous les chiffres sont des **valeurs initiales à équilibrer** en playtest. Ils vivront dans des fichiers de configuration (`economy.json`, `parts.json`, `legs.json`, `badges.json`), jamais en dur dans le code.

---

## 1. Principes directeurs

1. **Chaque vol rapporte quelque chose.** Un long vol raté vaut mieux qu'un vol court réussi « par chance ».
2. **On débloque de la variété, pas de la puissance.** Une nouvelle pièce ouvre une *façon de voler*, elle ne rend pas obsolète l'ancienne.
3. **Un déblocage toutes les 5 à 10 minutes** de jeu en moyenne (pièce, cosmétique, destination ou badge).
4. **Aucune frustration artificielle.** Le rythme est calibré pour un joueur qui **ne regarde jamais de publicité**. La pub récompensée est un bonus, pas une béquille (voir `MONETIZATION_STRATEGY.md`).
5. **Lisibilité.** Une seule monnaie, des prix ronds, des récompenses détaillées ligne par ligne à l'écran de résultats.

---

## 2. Monnaie : une seule monnaie douce, les **Boulons** 🔩

**Recommandation : une seule monnaie.**

- Une deuxième monnaie « premium » n'a aucun sens sans achats intégrés (interdits sur Poki) et complexifie l'interface.
- Les déblocages « prestige » (pièces expérimentales, cosmétiques rares) sont gérés par **badges et défis**, pas par une seconde monnaie.
- Nom proposé : **Boulons** — cohérent avec le thème bricolage/construction, visuellement simple (icône de boulon), drôle à faire pleuvoir à l'écran. Alternatives : *Hélices*, *Tickets*. (Décision à valider avec l'Agent 2 pour la DA.)

**Usages des Boulons** : acheter des pièces (disponibles selon les villes atteintes), acheter des cosmétiques dans la boutique du pilote.
**Non-usages** : pas de réparation payante (les dégâts ne sont jamais persistants), pas de « continuer » payant, pas de raccourci de progression.

---

## 3. Gains par vol

Chaque étape a une **valeur de référence `R`** (configurable) qui grossit doucement avec la progression.

| Étape | Trajet | R (Boulons) |
|---|---|---|
| 0 | Paris → Reims (tutoriel) | 60 |
| 1 | Reims → Bruxelles | 90 |
| 2 | Bruxelles → Amsterdam | 110 |
| 3 | Amsterdam → Londres | 130 |
| 4 | Londres → Berlin | 150 |
| 5 | Berlin → Rome | 175 |
| 6 | Rome → Athènes | 200 |
| 7 | Athènes → Istanbul | 230 |
| — | Rejouer une étape | R de l'étape rejouée |

> Itinéraire validé le 13/11/2026 (décision D6) : 9 villes, **8 étapes**, première traversée de mer à l'étape 3.

### 3.1 Formule

```
Gain = Distance + Atterrissage + Anneaux/Bonus + Objectifs (+ Premier arrivée)

Distance      = 0,6 × R × progression          (progression = distance parcourue / distance de l'étape, plafonnée à 1)
Atterrissage  = R × bonusQualité × facteurZone (uniquement si l'avion s'est posé, hors CRASH / WATER CRASH)
Anneaux/Bonus = 3 par anneau, 5 par bonus ramassé
Objectifs     = défi d'étape réussi (voir §7)
Première arrivée à une ville = + 1,0 × R (une seule fois)
Plancher      = 10 Boulons si progression ≥ 5 % (évite un « 0 » humiliant sans permettre le farm de décollages ratés)
```

| Qualité | bonusQualité | | Zone d'atterrissage | facteurZone |
|---|---|---|---|---|
| PERFECT LANDING | 0,40 | | Piste/zone officielle de la destination | 1,0 |
| GOOD LANDING | 0,25 | | Zone de la destination (champs, parcs proches) | 0,7 |
| ROUGH LANDING | 0,10 | | Ailleurs sur le trajet (champ, plage…) | 0,3 |
| CRASH LANDING | 0 | | | |
| WATER CRASH | 0 | | | |

**WATER CRASH** et **CRASH LANDING** conservent intégralement la part *Distance* et les anneaux. L'échec coûte le bonus d'atterrissage, jamais le vol déjà accompli. Pas de pénalité supplémentaire pour l'eau : la sanction est déjà la fin du vol.

### 3.2 Exemples (calcul illustratif avec R = 100, proche des étapes 2–3)

| Scénario | Distance | Atterr. | Anneaux | 1ʳᵉ arrivée | **Total** |
|---|---|---|---|---|---|
| Décollage raté, crash à 8 % | 5 | 0 | 0 | — | **10** (plancher) |
| WATER CRASH à 50 % (Manche), 2 anneaux | 30 | 0 | 6 | — | **36** |
| ROUGH dans un champ à 70 % | 42 | 3 | 9 | — | **54** |
| CRASH à 95 %, juste avant la destination | 57 | 0 | 12 | — | **69** |
| GOOD dans un parc de la ville d'arrivée | 60 | 17 | 12 | 100 | **189** |
| PERFECT sur la piste, 6 anneaux | 60 | 40 | 18 | 100 | **218** |
| Rejeu : PERFECT sur la piste | 60 | 40 | 18 | — | **118** |

Lecture : un crash à 95 % rapporte ~3,5× un décollage raté et ~60 % d'une réussite rejouée. C'est volontaire : **le long vol raté reste gratifiant**, mais réussir l'atterrissage reste clairement la meilleure option (+ bonus de 1ʳᵉ arrivée).

### 3.3 Pourquoi ce choix

- La part *Distance* (60 %) rend chaque mètre utile → récompense la tentative.
- La part *Atterrissage* (jusqu'à 40 %) rend l'atterrissage **la** mécanique décisive, conformément au brief.
- Le `facteurZone` crée le choix tactique demandé : « champ sûr mais loin » vs « piste difficile mais payante ».

---

## 4. Déblocage des pièces

### 4.1 Recommandation : **mix « catalogue par ville + achat en Boulons + pièces de défi »**

| Source | Ce qu'elle débloque | Rôle |
|---|---|---|
| **Départ** | Kit de base : 1 variante par catégorie essentielle (~10 pièces) | On vole dès la 1ʳᵉ minute |
| **Arrivée dans une ville** | Ouvre le **catalogue** de la ville (3–4 pièces visibles en boutique) | Sentiment de voyage : « à Amsterdam on trouve des ailes de moulin » |
| **Achat en Boulons** | Les pièces du catalogue | Le joueur choisit **quoi** expérimenter |
| **Badges / défis** | Pièces **expérimentales** (fusée, ballon, ailes à ressort…) | Récompense la maîtrise et la créativité |

Pourquoi pas uniquement « achat » : sans gating géographique, un joueur économe achète tout et casse le rythme de découverte.
Pourquoi pas uniquement « débloqué par destination » : le joueur ne fait aucun choix ; la monnaie n'a plus d'usage.

### 4.2 Pièces « latérales », pas « supérieures »

Chaque nouvelle pièce doit **gagner sur un axe et perdre sur un autre** par rapport à ce qui existe. Règle d'équilibrage (contrôlée par un script de validation de `parts.json` en Phase 2) :

- Pour chaque catégorie, aucune pièce ne doit dominer une autre sur **toutes** les stats (masse, portance, traînée, poussée, résistance, stabilité, maniabilité, conso).
- Le prix reflète la **spécialisation**, pas la puissance : une pièce très spécialisée coûte plus cher qu'une pièce polyvalente.
- Exemples de lignes de catalogue (à compléter avec l'Agent 2 / Agent 1) :

| Pièce | Catégorie | Gagne | Perd | Prix |
|---|---|---|---|---|
| Hélice bois (base) | Hélice | légère, fiable | poussée moyenne | 0 |
| Hélice tripale | Hélice | poussée + | masse +, conso + | 250 |
| Hélice à pales larges | Hélice | décollage court | vitesse max – | 250 |
| Ailes de planeur | Ailes | portance ++, plané | traînée +, fragiles | 400 |
| Ailes delta | Ailes | vitesse +, solides | portance –, atterrissage difficile | 400 |
| Train à ressorts | Train | encaisse les chocs ++ | traînée +, rebonds comiques | 300 |
| Flotteurs *(post-MVP, décision D7)* | Train | **amerrissage autorisé** (zones d'eau marquées) | traînée ++, masse + | 500 |

> Point de vigilance design : les **flotteurs** sont la seule pièce qui pourrait transformer l'eau en zone de secours. C'est cohérent avec le brief (« zones de secours exceptionnelles clairement identifiées ») à condition que ce soit une **pièce choisie**, avec un gros coût aérodynamique. **Arbitré le 13/11/2026 (D7) : flotteurs reportés après le MVP.**

### 4.3 Prix indicatifs

- Pièces de catalogue : **150 à 600 Boulons**.
- Objectif : le joueur moyen peut acheter **~2 pièces par étape** réussie, soit environ la moitié du catalogue de la ville. Le reste s'achète en rejouant ou plus tard → rejouabilité sans blocage.

---

## 5. Améliorations (upgrades) : **recommandation = pas d'upgrades de stats**

Le brief demande des « améliorations » **et** « pas de remplacement systématique par une meilleure pièce ». Ces deux exigences se contredisent :
un upgrade « Moteur niv. 2 = +10 % poussée sans contrepartie » est exactement une pièce strictement meilleure. Sur le long terme, il pousse à grinder au lieu d'expérimenter et rend l'équilibrage des étapes dépendant du niveau d'upgrade.

**Alternatives proposées (au choix, par ordre de préférence) :**

1. **Réglages gratuits (« tuning »)** — Phase 3. Certains slots ont un curseur à 3 crans : ex. calage d'aile (portance ↔ traînée), richesse du moteur (poussée ↔ conso). Ce sont des « améliorations » de compréhension, pas de puissance.
2. **Variantes déblocables** d'une même pièce (ex. *Moteur Rapide* / *Moteur Endurant*) — c'est déjà le système de pièces latérales.
3. Si un upgrade est jugé indispensable pour le sentiment de progression : **upgrades plafonnés à +5 % sur la résistance uniquement**, et les seuils des étapes calibrés **sans** upgrades.

→ **Décision utilisateur requise** (voir rapport).

---

## 6. Déblocage des destinations

- Une destination est **atteinte** si l'avion se pose (PERFECT, GOOD ou ROUGH) dans la **zone de destination** (piste + zones dégagées des derniers ~15 % de l'étape). Un CRASH LANDING dans la zone ne valide pas l'étape.
- Atteindre la ville : bonus de première arrivée, catalogue de la ville, cosmétique de ville, déblocage de l'étape suivante sur la carte.
- Toutes les étapes atteintes restent **rejouables librement** (farm doux, records, défis).
- **Filet de sécurité** (voir `DIFFICULTY_BALANCING.md` §6) : après plusieurs échecs, des aides apparaissent. On ne débloque **jamais** une destination « par pitié » : elle doit être atteinte, mais on aide le joueur à y parvenir.

---

## 7. Défis, badges et records

### 7.1 Défis d'étape (3 par étape, façon « 3 étoiles »)

Visibles sur la carte avant le départ. Exemple étape 1 (Reims → Bruxelles) :
- Atteindre Bruxelles.
- Traverser 5 anneaux.
- Réussir un PERFECT LANDING sur la piste.

Récompense : +0,2 × R par défi (une seule fois) ; les 3 défis d'une étape → 1 cosmétique.

### 7.2 Badges bronze / argent / or (liste initiale — 18 badges)

| # | Badge | Bronze | Argent | Or | Récompense type |
|---|---|---|---|---|---|
| 1 | **Globe-trotter** — villes atteintes | 2 | 4 | 6 | Cosmétiques / pièce exp. à l'or |
| 2 | **Kilométrage** — distance cumulée | 20 km | 100 km | 400 km | Cosmétique |
| 3 | **Pilote modèle** — PERFECT LANDING | 1 | 10 | 30 | Casque |
| 4 | **Série parfaite** — atterrissages réussis consécutifs | 3 | 5 | 10 | Lunettes |
| 5 | **Plongeur** — WATER CRASH | 1 | 5 | 15 | Bouée (cosmétique humour) |
| 6 | **Casse-cou** — CRASH LANDING | 3 | 15 | 50 | Casque cabossé |
| 7 | **Planeur** — distance parcourue moteur coupé (1 vol) | 500 m | 2 km | 5 km | Pièce exp. « ailes de goéland » |
| 8 | **Poids lourd** — atteindre une ville avec un avion de masse ≥ X | X | 1,3X | 1,6X | Pièce exp. |
| 9 | **Plume** — atteindre une ville avec masse ≤ Y | — | — | — | Cosmétique |
| 10 | **Chasseur d'anneaux** — anneaux cumulés | 25 | 100 | 300 | Traînée de fumée colorée |
| 11 | **Sans une égratignure** — étape sans aucune collision | 1 | 3 | 6 étapes différentes (sur 8) | Combinaison |
| 12 | **Ingénieur** — pièces différentes utilisées en vol | 15 | 30 | toutes | Pièce exp. |
| 13 | **Collectionneur** — cosmétiques possédés | 10 | 25 | 50 | Cosmétique rare |
| 14 | **Haute altitude** — altitude max | seuil 1 | 2 | 3 | Bonnet |
| 15 | **Bolide** — vitesse max | seuil 1 | 2 | 3 | Lunettes |
| 16 | **À un cheveu** — atterrir avec < 5 % de carburant | 1 | 5 | 15 | Moustache |
| 17 | **Têtu** — retenter la même étape après un échec | 5 | 20 | 50 | Cosmétique « persévérant » |
| 18 | **Long-courrier** — durée d'un vol | 90 s | 150 s | 240 s | Pièce exp. réservoir |

Les seuils précis (masse, altitude, vitesse) dépendent du modèle physique de l'Agent 1.
Badges 5, 6 et 17 : ils **valorisent l'échec avec humour**. C'est voulu (« Plongeur Or » doit faire sourire).

### 7.3 Records

Par étape : meilleure distance, meilleur atterrissage, temps le plus court, plus d'anneaux. Globaux : altitude, vitesse, distance en un vol, plus long vol plané.
Affichés sur l'écran de résultats (« Nouveau record ! ») et dans un carnet de vol. Pas de classement en ligne au MVP (pas de backend).

---

## 8. Cosmétiques du pilote

| Source | Part du catalogue | Exemples |
|---|---|---|
| Kit de départ | ~6 | casque cuir, lunettes, 3 couleurs |
| Arrivée dans chaque ville | 1 par ville (8) | Londres : chapeau melon ; Amsterdam : bonnet rayé ; Rome : lunettes rétro… (éviter les clichés lourds — à valider DA) |
| Défis d'étape (3/3) | 1 par étape (8) | |
| Badges | ~15 | voir tableau |
| **Boutique (Boulons)** | ~20 | puits de monnaie pour la fin de partie |

La boutique cosmétique est **le puits de monnaie de fin de jeu** : quand toutes les pièces sont achetées, les Boulons gardent une valeur. Prix : 100–800.
Total MVP visé : **~50 cosmétiques** (dimension à confirmer selon le coût de production art : un cosmétique = 1 sprite superposable, à valider avec l'Agent 2).

---

## 9. Courbe de progression visée

| Jalon | Joueur moyen (sans pub) | Commentaire |
|---|---|---|
| 1er décollage | < 30 s après le chargement | Pas de tutoriel bloquant |
| 1ʳᵉ pièce achetée | 3–5 min | Le joueur comprend la boucle |
| Reims atteint (tutoriel) | 1–3 min | 1ʳᵉ récompense |
| Bruxelles atteint | 5–12 min (3–6 vols) | 1ᵉʳ « wow » |
| Londres (1ʳᵉ mer) | ~30–45 min | |
| Berlin | ~45–65 min | |
| Istanbul (fin MVP) | **1 h 30 – 2 h 30** | |
| 100 % (badges or, cosmétiques) | 5–8 h | Joueurs engagés |

Justification :
- Les sessions sur portail web sont courtes (hypothèse : ~10–20 min, à confirmer avec les données Poki). Il faut donc **une récompense marquante par session** (une ville ou une pièce importante), d'où une étape ≈ 10–20 min de tentatives.
- Moins d'1 h 30 : contenu trop vite consommé, peu de rétention multi-jours.
- Plus de 3 h : risque de grind sur 8 étapes seulement.

### 9.1 Tableau des déblocages par étape (budget Boulons)

| Étape | Vols moyens pour réussir | Boulons gagnés (cumul ≈) | Nouveautés à l'arrivée |
|---|---|---|---|
| Départ Paris | — | 0 | Kit de base (~10 pièces), 6 cosmétiques |
| 0 → Reims (tuto) | 1–2 | ~100 | Ouverture du hangar, 1ʳᵉ pièce offerte |
| 1 → Bruxelles | 4 | ~450 | Catalogue Bruxelles (hélice tripale, train à ressorts) — **gaz manuels** |
| 2 → Amsterdam | 5 | ~1 000 | Catalogue (ailes de planeur, stabilisateur souple) — **rafales, canaux** |
| 3 → Londres | 5 | ~1 700 | Catalogue (réservoir +, hélice large) — **1ʳᵉ traversée de mer** |
| 4 → Berlin | 5 | ~2 500 | Catalogue (moteur lourd, ailes delta, aérofreins) — **ascendants** |
| 5 → Rome | 6 | ~3 500 | Catalogue (Alpes : moteur haute altitude, train tout-terrain) |
| 6 → Athènes | 6 | ~4 700 | Catalogue (ailerons longs, train de plage) — **îles et littoral** |
| 7 → Istanbul | 7 | ~6 200 | Fin MVP : pièce expérimentale « fusée d'appoint », cosmétique « Pilote du Bosphore » |

> Flotteurs : **reportés après le MVP** (décision D7). Les prix et quantités sont des valeurs initiales à équilibrer.

Coût total du catalogue de pièces (~18 pièces achetables × ~350) ≈ **6 300 Boulons** → le joueur a acheté ~85–95 % du catalogue en arrivant à Istanbul, sans grind. Le reste + cosmétiques = contenu post-MVP.

---

## 10. Garde-fous

- **Plafond anti-farm** : aucun (le farm de l'étape 1 rapporte peu par minute vs progresser — c'est suffisant). À réévaluer si les playtests montrent un farm abusif.
- **Pas de perte** : aucune action ne fait perdre des Boulons ou des pièces. Les dégâts ne sont jamais persistants.
- **Revente** de pièces : non (inutile, et source de regrets). Pas de « mauvais achat » possible, puisqu'aucune pièce n'est obsolète.
- **Sauvegarde** : Boulons, pièces, cosmétiques, badges, records et défis sont dans la sauvegarde locale (voir `TECHNICAL_ARCHITECTURE.md`).

---

## 11. Points à aligner

- **Agent 1 (dev)** : unités de distance/masse/vitesse pour les seuils de badges ; validation automatique « aucune pièce dominante » dans `parts.json`.
- **Agent 2 (design/DA)** : nom de la monnaie, liste finale des pièces par ville, cosmétiques de ville (éviter les stéréotypes), budget de production des ~50 cosmétiques.
- **Agent 3 (marketing)** : les badges « échec drôles » (Plongeur, Casse-cou) sont de bons supports de capture d'écran / miniature.
