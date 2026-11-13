# GAME DESIGN — CAN YOU FLY?

> Statut : **proposition Phase 1 (conception)** — en attente de validation.
> Responsable : Agent 2 (Game Design & Art Direction). Documents liés : `LANDING_AND_CRASH_SYSTEM.md`, `PROGRESSION_SYSTEM.md`, `WORLD_MAP.md`, `PILOT_CHARACTER.md`, `TECHNICAL_ARCHITECTURE.md`.
> Les chiffres sont **indicatifs** : ils servent à exprimer les intentions et seront réglés en prototype.

---

## 1. Vision

**En une phrase :** *Bricole un avion improbable, pilote-le à travers l'Europe et pose-le… si tu peux.*

### Piliers (tout ce qui ne sert pas un pilier est coupé)

| # | Pilier | Ce que ça veut dire concrètement |
|---|--------|----------------------------------|
| 1 | **Chaque choix de pièce se sent en vol** | Une pièce change visiblement le comportement (montée, inertie, vibration, décrochage). Pas de stat « cachée » sans effet perceptible. |
| 2 | **L'atterrissage est le climax** | Les 15 dernières secondes concentrent la tension : choix de zone + exécution. |
| 3 | **Échouer est drôle et instructif** | Chaque crash est un mini-spectacle et l'écran de résultats dit *pourquoi* (« trop rapide de 12 km/h »). |
| 4 | **Un voyage, pas des niveaux** | On part de quelque part, on va quelque part, la carte se remplit. |
| 5 | **Jouable en 5 secondes** | Un avion par défaut est prêt ; le premier vol commence sans menu obligatoire. |

### Ce que le jeu n'est PAS
- Pas un simulateur (aucun instrument réaliste, pas de lacet/roulis en 3D).
- Pas un « Learn to Fly » où l'on regarde un avion planer : le joueur pilote en continu.
- Pas un bac à sable de construction libre façon éditeur de véhicules (trop coûteux, illisible sur mobile, et casse l'équilibrage).

---

## 2. Boucle de jeu

```
BUILD (20–60 s) → FLY (60–150 s) → LAND OR CRASH (5–15 s) → REWARD (10 s) → UNLOCK / DISCOVER (5–20 s) → BUILD AGAIN
```

Durée d'une boucle complète : **2 à 4 minutes**, ce qui correspond aux sessions Poki (courtes, répétées).

### 2.1 Les 60 premières secondes (FTUE)

| Temps | Ce qui se passe | Intention |
|-------|-----------------|-----------|
| 0–3 s | Écran titre animé : le pilote tape sur son avion qui tousse. Un seul gros bouton **VOLER**. | Personnalité immédiate, zéro friction. |
| 3–6 s | Hangar de départ (Paris) avec l'avion par défaut déjà assemblé. Flèche + doigt animé « Maintiens pour accélérer ». | Pas de construction imposée au 1er vol. |
| 6–15 s | Roulage + décollage. Bulle contextuelle : « ↑ / zone droite = cabrer ». Le pilote crie de joie au décollage. | Apprendre l'axe principal en le faisant. |
| 15–40 s | Croisière courte (étape tutoriel ~45 s). Un anneau facile + un courant ascendant visible. | Découvrir les événements positifs d'abord. |
| 40–55 s | « Destination en vue ! » ; caméra dézoome, deux zones balisées : **piste (sûre, +bonus)** et **champ (large, pénalité légère)**. Indicateur de vitesse verticale coloré. | Introduire le choix tactique. |
| 55–60 s | Atterrissage (même raté → récompense) puis **écran de résultats** et **1re pièce débloquée** (ailes plus grandes) avec bouton « Essayer dans le hangar ». | La boucle REWARD → UNLOCK → BUILD est apprise en une minute. |

Règle FTUE : le 1er vol **ne peut pas finir en WATER CRASH** (étape sans eau) et l'avion par défaut est réglé pour réussir au moins un ROUGH LANDING avec un pilotage moyen.

### 2.2 Détail des phases

**BUILD** — voir §3. Toujours sautable : le bouton « Repartir avec le même avion » est sur l'écran de résultats.

**FLY** — structure d'une étape en 4 segments (cf. §5).

**LAND OR CRASH** — cf. `LANDING_AND_CRASH_SYSTEM.md` pour les seuils. Côté design : le joueur doit toujours voir *au moins deux options* de zone avant la décision finale.

**REWARD** — pièces de monnaie = f(distance, qualité d'atterrissage, défis). Un crash après un long vol rapporte plus qu'un perfect sur 200 m.

**UNLOCK / DISCOVER** — pièces d'avion, cosmétiques, nouvelle étape sur la carte, carte postale de la ville atteinte.

---

## 3. Écran de construction (hangar)

### 3.1 Principe : construction à emplacements (slots)
L'avion = **un fuselage** (châssis) qui porte **10 slots**. Chaque slot accepte une catégorie de pièce. Les slots facultatifs peuvent rester vides (l'avion vole alors différemment, parfois mal — c'est voulu).

| Slot | Obligatoire | Particularité |
|------|-------------|---------------|
| Fuselage (châssis) | oui | Détermine le nombre de slots accessoires et la masse de base. |
| Nez / Moteur | non* | *Sans moteur = planeur, lancé par catapulte (défi). |
| Hélice | si moteur à hélice | Grisé si moteur à réaction / fusée. |
| Aile principale | oui | **3 positions** : avant / milieu / arrière → déplace le centre de portance par rapport au CG. |
| Petite aile (canard) | non | Devant ; augmente la maniabilité, réduit la stabilité. |
| Stabilisateur (empennage horizontal) | non | Stabilité en tangage. Sans lui : avion « nerveux ». |
| Gouverne / dérive | non | Efficacité des commandes (réactivité au cabrer/piquer). |
| Train d'atterrissage | non | Sans train : atterrissage sur le ventre = ROUGH au mieux. |
| Réservoir | non | Carburant ; sans réservoir supplémentaire = réservoir interne minimal du fuselage. |
| Accessoire (1 à 2 selon fuselage) | non | Aéro ou spécial (voir catalogue). |

### 3.2 UX glisser-déposer
- **Inventaire** en bas (mobile) ou à gauche (desktop), onglets par catégorie (icônes, pas de texte).
- On **glisse** une pièce : les slots compatibles s'illuminent, les autres s'assombrissent. Snap magnétique à < 60 px.
- **Tap sur une pièce** de l'inventaire = l'installer directement dans son slot (indispensable sur mobile : le drag est un bonus, pas une obligation).
- Tap sur une pièce montée → mini-fiche + bouton « retirer ». Pour l'aile : 3 poignées de position.
- L'avion **réagit physiquement** quand on pose une pièce : il penche vers l'avant/arrière sur son support selon le CG (ressort cartoon). C'est l'indicateur d'équilibre le plus lisible qui soit.

### 3.3 Indicateurs
- **Jauge de masse** (silhouette d'un poids qui se remplit) avec seuil « trop lourd pour décoller sur cette piste ».
- **Marqueur CG** (cercle noir/jaune) et **marqueur centre de portance** (flèche bleue) dessinés sur l'avion. Zone verte = équilibré.
- **Fiche de stats** en 5 barres : *Vitesse, Montée, Stabilité, Maniabilité, Autonomie* (+ *Solidité* en icône). Quand on survole/sélectionne une pièce, les barres montrent le **delta** (vert/rouge) avant de la poser.
- Pas de nombres bruts côté joueur (seulement en option « Détails »).

### 3.4 Validation avant décollage
Bouton **DÉCOLLER**. Si un problème bloquant existe, l'avion part quand même (c'est drôle) **mais** un panneau du pilote prévient une fois : « Euh… pas de train d'atterrissage. Sûr ? » → *Oui, je suis courageux* / *Corriger*. Problèmes signalés : trop lourd pour la piste, CG hors zone, pas de train, carburant < distance minimale estimée.

### 3.5 Avion par défaut et presets
- **« Le Coucou »** : fuselage bois, petit moteur hélice, ailes moyennes au milieu, stabilisateur standard, train à roues, petit réservoir. Équilibré, lent, pardonne.
- 3 emplacements de **sauvegarde de configuration** (MVP) pour revenir à un avion favori en un tap.

---

## 4. Catalogue de pièces (prototype)

Échelle des stats : **0–10** (sauf masse en kg « arcade »). Les valeurs sont des intentions relatives, pas des réglages finaux. **Règle d'or : aucune pièce n'est meilleure qu'une autre sur toutes les colonnes.**

Colonnes : M = masse, P = portance, T = traînée, Pu = puissance, R = résistance, St = stabilité, Ma = maniabilité, C = consommation.

### 4.1 Fuselages
| Pièce | M | T | R | St | Slots acc. | Trade-off |
|-------|---|---|---|----|-----------|-----------|
| Caisse en bois (défaut) | 40 | 5 | 4 | 6 | 1 | Polyvalent, fragile. |
| Tube alu léger | 25 | 3 | 3 | 3 | 1 | Rapide mais instable et fragile. |
| Baignoire blindée | 70 | 6 | 9 | 8 | 2 | Encaisse tout, décolle mal. |

### 4.2 Moteurs
| Pièce | M | Pu | C | Trade-off |
|-------|---|----|---|-----------|
| Tondeuse 2 temps (défaut) | 10 | 3 | 2 | Faible mais économe. |
| Bicylindre rétro | 22 | 6 | 5 | Bon compromis, chauffe (vibrations). |
| Turbo « Ça passe » | 40 | 9 | 9 | Énorme poussée, dévore le carburant, alourdit le nez. |

### 4.3 Hélices
| Pièce | M | Pu (bonus) | R | Trade-off |
|-------|---|-----------|---|-----------|
| Bois 2 pales (défaut) | 2 | +0 | 4 | Neutre. |
| Métal 4 pales | 6 | +2 | 7 | Plus de poussée à basse vitesse, plus lourde. |
| Ventilateur de bureau | 1 | −1 | 2 | Ultra léger, ridicule, casse au moindre choc. |

### 4.4 Ailes principales
| Pièce | M | P | T | Ma | Trade-off |
|-------|---|---|---|----|-----------|
| Ailes moyennes (défaut) | 12 | 5 | 4 | 5 | Neutre. |
| Grandes ailes de planeur | 20 | 9 | 7 | 3 | Plane très loin, lent, sensible au vent. |
| Ailes courtes delta | 10 | 3 | 2 | 8 | Rapide et vif, décroche vite à basse vitesse. |
| Ailes en toile de parasol | 4 | 6 | 6 | 4 | Très légères, fragiles (se déchirent → perte de portance). |

### 4.5 Petites ailes (canard)
| Pièce | M | P | Ma | St | Trade-off |
|-------|---|---|----|----|-----------|
| Aucune | – | – | – | – | Référence. |
| Moustaches | 3 | +1 | +2 | −1 | Plus vif, moins stable. |
| Ailerons de requin | 5 | +2 | +3 | −2 | Très vif, demande du doigté. |

### 4.6 Stabilisateurs (empennage horizontal)
| Pièce | M | St | Ma | T |
|-------|---|----|----|---|
| Standard (défaut) | 5 | +3 | −1 | +1 |
| Double grand | 9 | +5 | −3 | +2 |
| Petit en T | 3 | +1 | 0 | +0 |

### 4.7 Gouvernes / dérives
| Pièce | M | Ma | St | Note |
|-------|---|----|----|------|
| Standard (défaut) | 3 | +1 | +1 | |
| Grande gouverne | 5 | +3 | 0 | Réaction rapide aux commandes. |
| Planche à repasser | 6 | +2 | +2 | Lourde mais robuste (R +3). |

### 4.8 Trains d'atterrissage
| Pièce | M | R (atterrissage) | T | Note |
|-------|---|-------------------|---|------|
| Roues de vélo (défaut) | 4 | 4 | +1 | Seuil d'atterrissage standard. |
| Gros pneus tout-terrain | 10 | 8 | +2 | Tolère champs et pentes ; traînée. |
| Patins de luge | 3 | 5 | 0 | Excellents sur herbe/neige, glissent longtemps sur piste. |
| Ressorts géants | 6 | 6 | +1 | Rebondit ! Absorbe un choc dur, mais peut renvoyer en l'air. |

### 4.9 Réservoirs
| Pièce | M (plein) | Carburant | Note |
|-------|-----------|-----------|------|
| Bidon (défaut) | 8 | 4 | |
| Fût de 200 L | 25 | 9 | L'avion s'allège en vol (le comportement change au fil du vol). |
| Gourde de randonnée | 2 | 1 | Pour les planeurs purs. |

### 4.10 Accessoires aérodynamiques
| Pièce | Effet | Coût |
|-------|-------|------|
| Carénage de nez | T −2 | M +4 |
| Winglets | P +1, St +1 | M +2 |
| Aérofreins | Bouton « freiner » en approche (réduit la vitesse) | M +3, T +1 permanent |

### 4.11 Spéciaux (1 usage par vol, bouton dédié)
| Pièce | Effet | Coût / risque |
|-------|-------|---------------|
| Parachute de queue | Ralentit fortement à l'atterrissage | M +5 ; ouvert trop tôt = chute. |
| Airbag cartoon | Transforme un CRASH en ROUGH une fois (sauf eau) | M +6 ; ne rapporte jamais de PERFECT. |
| Flotteurs *(MVP, à valider)* | Permet d'utiliser les **zones d'amerrissage balisées** (bouées). L'eau non balisée reste un WATER CRASH. | M +10, T +3. |

### 4.12 Pièces expérimentales (le « fun »)
| Pièce | Effet | Coût / risque |
|-------|-------|---------------|
| Fusée de feu d'artifice | Boost énorme pendant 3 s | Une seule fois, l'avion tremble, risque de vrille. |
| Ballon de fête foraine | Portance constante + flotte en plané | Énorme traînée, éclate en cas de collision. |
| Catapulte à ressort (au sol) | Lancement sans piste, pour les planeurs | Décollage en cloche imprévisible. |

**Total prototype : 12 catégories, 36 pièces.** Si la production est trop lourde : réduire à 2 variantes par catégorie (≈ 24 pièces) en gardant fusée + ressorts (identité).

---

## 5. Structure d'une étape (vol)

| Segment | Durée | Contenu | Commandes clés |
|---------|-------|---------|----------------|
| **Décollage** | 5–10 s | Piste de longueur limitée. Si pas assez de vitesse en bout de piste → l'avion tombe dans l'herbe (ROUGH « décollage raté », petite récompense). | Poussée, cabrer au bon moment. |
| **Croisière** | 40–110 s | Paysage de l'étape, 3–6 événements, gestion du carburant. Quand le carburant est vide : moteur qui tousse, vol plané. | Cabrer/piquer, poussée. |
| **Approche** | 10–20 s | Déclenchée à distance fixe de la destination **ou** quand l'altitude < seuil sans carburant. Caméra dézoome, zones d'atterrissage révélées avec icônes de difficulté. | Choix de zone, gestion de la vitesse. |
| **Atterrissage** | 3–8 s | Contact, glissade, arrêt (ou chaos). Ralenti 0,5× à l'impact si c'est serré. | Garder le nez haut, aérofreins/parachute. |

### 5.1 Choix tactiques d'atterrissage
À l'approche, le joueur voit toujours au moins :
- **Une zone sûre mais exigeante** (piste de l'aéroport : courte ou en bout de parcours, bonus × 1,5).
- **Une zone facile mais imparfaite** (champ, parc : large, pénalité de bonus, « atterri à 15 km de Londres »).
- Parfois **une zone risquée/fun** (toit plat, plage étroite, plateau en montagne) avec bonus spécifique ou badge.
- L'option implicite **« continuer »** si l'avion a encore de l'altitude/carburant (viser la piste au-delà).

Chaque zone a une **pancarte** (icône piste/champ/toit + 1 à 3 étoiles de difficulté) visible ≥ 4 s avant d'être atteignable.

---

## 6. Événements de vol

| Événement | Effet | Lecture visuelle | Étapes |
|-----------|-------|------------------|--------|
| Vent de face / dans le dos | Vitesse sol ±, conso effective | Traînées blanches + manche à air dans le HUD | Toutes |
| Rafale | Poussée brève vers le haut/bas | Nuage « soufflant » avec joues gonflées, apparaît 2 s avant | Littoral, montagne |
| Courant ascendant | Gain d'altitude gratuit | Colonne de chaleur ondulante + oiseaux qui tournent | Campagne, désert |
| Turbulences | Secousses, contrôle réduit | Zone de nuages gris-violets crantés | Montagne, orage |
| Anneaux | Bonus pièces / défi | Gros anneau doré, 3 consécutifs = combo | Toutes |
| Boost (tremplin d'air) | +vitesse | Flèches chevron arc-en-ciel | Toutes (rare) |
| Bonus (bidon d'essence, pièces) | Carburant / monnaie | Objet qui brille, petit bob vertical | Toutes |
| Obstacles volants (oiseaux, ballons météo, montgolfières) | Collision = dégâts | Silhouette claire, se déplace lentement et lisiblement | Selon biome |

### Règles de lisibilité (non négociables)
1. **Télégraphier** : tout événement négatif est visible ≥ 2 s avant d'affecter l'avion.
2. **Code couleur fixe** : doré = bon, gris-violet = mauvais, blanc = neutre (vent).
3. **Jamais plus de 2 événements simultanés** à l'écran.
4. **Zone d'approche protégée** : aucun nouvel événement négatif dans les 8 dernières secondes avant l'atterrissage, sauf le vent annoncé dès le début (affiché sur la carte de l'étape).
5. **Déterminisme** : à étape égale, les événements sont aux mêmes endroits (seed par étape) → le joueur peut apprendre et optimiser. Une variante « météo du jour » pourra varier plus tard.

---

## 7. Écran de résultats

### 7.1 Mise en scène (8–12 s, skippable dès 1,5 s)
1. Gel sur l'avion à l'arrêt (ou l'épave), caméra qui zoome sur le pilote dans son **état réel** et avec **tous ses cosmétiques**.
2. Tampon animé de la catégorie (PERFECT / GOOD / ROUGH / CRASH / WATER CRASH) façon tampon de passeport.
3. Phrase humoristique + narration du trajet (« Départ de Paris. Destination Londres. Atterri dans un champ à 15 km de Londres. »).
4. Défilement des stats puis des récompenses (compteur de pièces qui « tombe » dans la tirelire).
5. Déblocages éventuels (pièce, cosmétique, badge) en cartes qui se retournent.

### 7.2 Contenu
Ville de départ · destination · distance parcourue (et % de l'étape) · durée · altitude max · vitesse max · zone d'atterrissage · qualité · état de l'avion (schéma avec pièces abîmées en rouge) · état du pilote · récompenses · badges · **conseil** (« Tu touchais le sol à 9 m/s : vise moins de 5 »).

### 7.3 Boutons
**Revoler (même avion)** — **Hangar** — **Carte**. (Emplacement naturel d'un interstitiel Poki *après* clic, cf. `MONETIZATION_STRATEGY.md`.) Bouton optionnel « × 2 récompense (pub) » à droite, jamais au centre.

### 7.4 Phrases (exemples, à étendre à ~5 par catégorie et contexte)
- PERFECT : « Atterrissage parfait. Tu es officiellement un pilote ! » / « Même les mouettes applaudissent. »
- GOOD : « Propre. Le café n'a même pas débordé. »
- ROUGH : « Un peu brutal, mais on est vivants. » / « L'avion a souffert. Le pilote aussi. »
- CRASH : « Tu voulais rejoindre Londres. Tu as trouvé une grange. » / « Techniquement, tu es arrivé au sol. »
- WATER CRASH : « L'eau n'était pas une piste d'atterrissage ! » / « Les poissons te mettent 2/10. »
- Contexte : décollage raté (« Le vol le plus court de l'histoire. »), panne sèche (« Il manquait juste… tout le carburant. »).

---

## 8. Périmètre par phase

| Élément | Prototype | MVP | Plus tard |
|---------|-----------|-----|-----------|
| Hangar à slots, tap + drag, indicateurs CG/masse | ✅ | ✅ | |
| Catalogue | 12 catégories, ~24–36 pièces | ~45 pièces | Pièces saisonnières |
| Étapes | 1 étape tutoriel + 1 vraie étape | 8 étapes (Paris → Istanbul) | Nouvelles régions |
| Événements | Vent, ascendant, anneaux, oiseaux | Tous §6 | Météo du jour, nuit |
| Zones d'atterrissage | Piste + champ + eau | + toits, plages, plateaux | Porte-avions, bouées |
| Résultats complets + phrases | ✅ (version simple) | ✅ animé | Partage d'image |
| Spéciaux / expérimentaux | Fusée, ressorts, airbag | Tous | |
| Flotteurs / amerrissage balisé | ❌ | ❌ (zones de secours balisées seulement) | ✅ (décision D7) |
| Presets d'avion sauvegardés | ❌ | ✅ | |
| Mode défi quotidien | ❌ | ❌ | ✅ |

## 9. Décisions

> **Validées le 13/11/2026** (voir `DECISIONS.md`) : 1 → D1 ✅, 2 → D2 ✅, 3 → retenu (règles d'équité), 4 → D7 : flotteurs après le MVP, 5 → D6 : itinéraire en 8 étapes ✅.

1. Construction à slots (et non libre) avec aile principale positionnable.
2. Premier vol sans construction (avion par défaut).
3. Événements déterministes par étape.
4. Flotteurs + zones d'amerrissage balisées (oui/non, MVP ou plus tard).
5. Ordre des villes (voir `WORLD_MAP.md`, proposition de ne pas commencer par la Manche).
