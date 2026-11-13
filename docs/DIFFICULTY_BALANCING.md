# DIFFICULTY_BALANCING — Courbe de difficulté et méthode d'équilibrage

> Statut : **proposition Phase 1 — à valider**. Auteur : Agent 4 (Monetization & Game Economy).
> Chiffres = **valeurs initiales**, destinées à vivre dans des fichiers de configuration éditables. Les unités définitives (m, m/s, degrés « jeu ») seront fixées par l'Agent 1 dans `TECHNICAL_ARCHITECTURE.md`.

---

## 1. Philosophie

- **Facile à essayer, difficile à réussir parfaitement.** Atteindre une ville doit être à la portée de tous ; le PERFECT LANDING est la vraie maîtrise.
- **La difficulté vient de la décision et de l'exécution**, jamais d'un aléa invisible (brief §7.6). Tout danger est **visible ou annoncé** avant d'être dangereux.
- **Une nouveauté de difficulté par étape**, pas plus. Le joueur apprend une chose à la fois.
- **L'échec doit être explicable** en une phrase sur l'écran de résultats (« Trop rapide au contact : 9 m/s, ton train encaisse 6 m/s »).

---

## 2. Courbe par étape

| Étape | Trajet | Durée de vol visée | Nouveauté introduite | Terrain d'arrivée | Part d'eau | Vent | Taux de réussite visé* |
|---|---|---|---|---|---|---|---|
| 1 | Paris → Londres | 60–80 s | Bases : décollage, tangage, atterrissage. **La Manche** = 1ʳᵉ eau (courte, survolable avec le kit de base) | Grande piste + champs | ~20 % | Aucun | 1ᵉʳ essai 35 %, ≤ 4 essais 80 % |
| 2 | Londres → Amsterdam | 70–90 s | **Vent constant** (de face/de dos, annoncé sur la carte) + **anneaux** | Campagne plate, champs, canaux (eau !) | ~30 % | Faible, constant | ≤ 5 essais 75 % |
| 3 | Amsterdam → Berlin | 80–100 s | **Ville** à l'arrivée : obstacles (bâtiments, lampadaires), zones étroites | Piste urbaine courte + parcs | ~5 % | Rafales légères (annoncées par manche à air/feuilles) | ≤ 5 essais 70 % |
| 4 | Berlin → Rome | 100–130 s | **Montagnes** (Alpes) : relief, courants ascendants/descendants visibles | Plateaux, pistes inclinées | ~10 % | Ascendances | ≤ 6 essais 65 % |
| 5 | Rome → Athènes | 110–140 s | **Mer et îles** : choix entre îles (atterrissages sur plages, petites pistes) — la mer Ionienne impose un avion endurant ou un plan | Petite piste côtière, plages | ~50 % | Vent latéral | ≤ 6 essais 60 % |
| 6 | Athènes → Istanbul | 120–150 s | **Synthèse** : îles + relief + ville dense, turbulences | Grand aéroport + toits/parcs d'Istanbul, Bosphore | ~35 % | Turbulences + rafales | ≤ 7 essais 55 % |

\* « ≤ N essais X % » = X % des joueurs ayant tenté l'étape l'ont réussie en N tentatives ou moins. Ces cibles servent de **critères de validation** en playtest.

**Règle de durée** : l'étape s'allonge de ~10–15 s à chaque fois, jamais plus. Au-delà de ~150 s, un échec à la fin devient frustrant (sauf si le système de récompense compense — c'est le cas grâce à la part *Distance*).

---

## 3. Paramètres d'équilibrage

Tous dans des fichiers JSON (proposition de découpage, format final décidé par l'Agent 1) :

| Fichier | Contenu |
|---|---|
| `legs.json` | Par étape : longueur, profil du terrain, zones d'atterrissage (position, largeur, qualité de surface), zones d'eau, obstacles, vent, événements, défis, `R` (récompense de référence) |
| `parts.json` | Stats des pièces (masse, portance, traînée, poussée, résistance, stabilité, maniabilité, conso, prix, ville de déblocage) |
| `landing.json` | Seuils de qualité d'atterrissage (ci-dessous) |
| `economy.json` | Formule de gain, plancher, bonus, prix cosmétiques |
| `ads.json` | Activation des placements, filtres de fréquence (voir MONETIZATION_STRATEGY) |
| `assists.json` | Règles d'aide anti-frustration (§6) |

### 3.1 Seuils d'atterrissage (valeurs initiales, à exprimer dans les unités du moteur)

La qualité est **le pire des critères** (chaque critère donne une note, la plus mauvaise l'emporte), ce qui rend l'explication simple : « c'est l'angle qui t'a coûté le PERFECT ».

| Critère | PERFECT | GOOD | ROUGH | CRASH au-delà |
|---|---|---|---|---|
| Vitesse verticale au contact | ≤ 0,35 × T | ≤ 0,6 × T | ≤ 1,0 × T | > T |
| Angle de tangage au contact (nez légèrement haut = idéal) | 0° à +8° | –4° à +14° | –10° à +20° | hors plage |
| Inclinaison/retournement | — | — | — | avion à l'envers = CRASH |
| Vitesse horizontale vs longueur de zone restante | s'arrête dans la zone | dépasse ≤ 10 % | dépasse ≤ 25 % / sort sur l'herbe | percute un obstacle |
| Surface | piste | piste, herbe | herbe, sable, terre | eau (sans flotteurs) = WATER CRASH |
| Obstacle touché pendant le roulage | aucun | aucun | 1 léger | collision importante |

`T` = **tolérance du train d'atterrissage** (stat de la pièce, ex. train standard T = 6 m/s, train à ressorts T = 9 m/s, sans train / patins T = 3 m/s). Ainsi les seuils sont **liés à la construction**, comme le demande le brief §7.3, sans multiplier les cas particuliers.

Modificateurs :
- Surface : herbe × 0,85 sur T, sable × 0,75, terre labourée × 0,7 ; piste × 1,0.
- Dégâts en vol : une aile endommagée réduit la stabilité, pas T ; une roue arrachée réduit T de 40 %.

### 3.2 Carburant

- Le carburant fixe la **distance motorisée** ; le plané fait le reste. Valeur initiale : avec le kit de base, le carburant couvre ~70 % de l'étape 1 ; le plané et le bon pilotage couvrent le reste. Étapes suivantes : demander de mieux gérer la puissance ou d'investir dans un réservoir (avec sa masse).
- Indicateur de **projection de portée** (« au rythme actuel, tu peux atteindre ~X ») : fortement recommandé, c'est l'outil qui transforme la difficulté en **décision**.

### 3.3 Vent et événements

- Vent constant : ±10–25 % de la vitesse de croisière de base. Toujours **annoncé** sur la carte avant le départ et visible en vol (particules, nuages).
- Rafales : durée 1–3 s, **précédées** d'un signal visuel 1 s avant (feuilles, manche à air, lignes de vent).
- Courants ascendants : zones visibles (oiseaux qui tournent, chaleur au-dessus des champs, nuages).
- Densité d'événements : 0 (étape 1) → ~1 événement toutes les 10–15 s (étape 6). Jamais deux nouveaux types simultanés.

---

## 4. Équilibrage des pièces

- Score indicatif par pièce : chaque stat normalisée sur [0–1], les pièces d'une même catégorie doivent avoir une **somme pondérée proche** (± 10 %) → pas de pièce dominante. Contrôle automatique à prévoir (script de validation des données — Phase 2).
- Chaque étape doit être **réussissable avec au moins 2 configurations très différentes** (ex : léger planeur vs lourd motorisé). Critère d'acceptation des étapes.
- Le **kit de base** doit pouvoir terminer les étapes 1 à 3 avec un bon pilotage (preuve que la progression est de la variété, pas un mur de puissance). Les étapes 4–6 peuvent exiger *au moins une* pièce du catalogue, mais jamais une pièce précise.

---

## 5. Méthode d'équilibrage

1. **Fichiers de config + mode debug** (Phase 2) : en build de développement, un panneau permet d'ajuster les seuils en direct et d'afficher vitesse verticale, angle, T au contact.
2. **Simulation de progression** (tableur ou script) : nombre de vols × gains moyens par résultat → vérifier la durée cible du MVP (1 h 30 – 2 h 30) **sans pub récompensée**.
3. **Playtests** : 5 à 8 testeurs « frais » par jalon (prototype, MVP, polish), observation sans aide, mesure : temps jusqu'au 1ᵉʳ décollage, essais par étape, abandons, verbatims sur les échecs (« je n'ai pas compris pourquoi »).
4. **Télémétrie locale** (debug uniquement) : journal des vols (étape, config, résultat, cause d'échec, durée) exportable en CSV pour analyse. Aucune donnée envoyée à un service tiers.
5. **Après lancement** : métriques de la console Poki (temps de jeu, rétention — selon ce que Poki met à disposition ; à vérifier). Ajustements par simples changements de config.

> Point à vérifier (Agent 1/3) : l'usage d'un outil d'analytics tiers sur Poki est probablement restreint. Hypothèse de travail : **pas d'analytics tiers**.

---

## 6. Règles anti-frustration (`assists.json`)

Déclenchées par les **échecs consécutifs sur la même étape** (compteur sauvegardé, remis à zéro à la réussite) :

| Échecs consécutifs | Aide | Gratuite ? |
|---|---|---|
| 1 | Écran de résultats : **cause principale** de l'échec + conseil ciblé (« Tu es arrivé trop vite : coupe les gaz plus tôt ») | Oui |
| 2 | Au hangar : **suggestion de pièce** possédée ou abordable adaptée à la cause (« Le train à ressorts encaisse mieux les chocs ») | Oui |
| 3 | En vol : **ligne de projection de trajectoire** pendant l'approche + balise de la zone d'atterrissage la plus sûre | Oui (désactivable) |
| 3+ | Proposition facultative R4 (boost de carburant / vent favorable) | Pub récompensée facultative |
| 5 | **Aide au pilotage** proposée : stabilisation automatique légère en approche (option, pas imposée) | Oui |
| 8 | Proposition d'un **« plan de vol » de démonstration** : configuration recommandée pré-assemblée avec les pièces du joueur | Oui |

Principes :
- Les aides n'empêchent pas un PERFECT LANDING ni les badges (pas de stigmatisation), sauf éventuellement « Sans une égratignure » avec stabilisation auto — à décider.
- On ne réduit **jamais** la difficulté de l'étape en douce (pas de « rubber banding » caché) : les aides sont visibles et proposées.

---

## 7. Indicateurs de santé (à surveiller en playtest)

| Indicateur | Alerte si |
|---|---|
| Temps avant 1ᵉʳ décollage | > 45 s |
| Réussite étape 1 en ≤ 4 essais | < 70 % |
| Part des échecs « incompris » (verbatims) | > 20 % |
| Abandon sur une étape | > 30 % des joueurs y restent bloqués > 10 essais |
| Part des WATER CRASH sur une étape | > 60 % (l'eau est trop punitive / mal annoncée) |
| Configuration unique utilisée par > 70 % des joueurs | une pièce est dominante → rééquilibrer |

---

## 8. Points à aligner

- **Agent 1** : unités, modèle de contact (vitesse verticale/angle mesurés comment), faisabilité de la ligne de projection et de l'aide au pilotage, mode debug.
- **Agent 2** : signalétique visuelle des dangers (vents, rafales, ascendances, eau), lisibilité des zones d'atterrissage, messages d'explication des échecs (ton humoristique + info utile).
- **Agent 3** : les 30 premières secondes (taux de conversion Poki) dépendent de l'étape 1 : la garder très accessible.
