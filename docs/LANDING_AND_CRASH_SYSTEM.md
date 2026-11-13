# Atterrissage, collisions et crashs — CAN YOU FLY?

> Statut : **proposition de conception (Phase 1)**. Auteur : Agent 1 — Game Development.
> Ce système est **au cœur du prototype** (Phase 2) : il n'est pas reportable.
> Liés : [PHYSICS_AND_CONTROLS.md](PHYSICS_AND_CONTROLS.md), [TECHNICAL_ARCHITECTURE.md](TECHNICAL_ARCHITECTURE.md). Les réactions du pilote et les textes humoristiques relèvent de PILOT_CHARACTER.md / GAME_DESIGN.md ; les montants de récompense de PROGRESSION_SYSTEM.md.

---

## 1. Principe

Le vol se termine quand l'avion **s'immobilise au sol** (vitesse < 2 u/s pendant 0,5 s), **s'écrase**, ou **touche l'eau**. L'atterrissage n'est pas un instant mais une **séquence** :

```
APPROCHE ──► CONTACT ──► ROULAGE ──► ARRÊT ──► JUGEMENT ──► RÉSULTATS
   │            │           │
   │            │           └─ obstacles, fin de zone, capotage → dégradation
   │            └─ rebond possible → nouveau contact, on garde le pire
   └─ remise des gaz possible tant qu'il n'y a pas eu de contact
```

Le jugement final = **la pire note** observée sur l'ensemble des contacts et du roulage, ajustée par les dégâts subis.

---

## 2. Détection du contact

- L'avion possède une **hitbox composée** : 1 point/cercle par train (roues), 1 cercle par aile, 1 pour le nez, 1 pour la queue, 1 capsule pour le fuselage.
- Le sol est une **polyligne** (relief) annotée par segments : type de surface, « atterrissable » ou non, éventuelle zone d'atterrissage associée.
- **Contact propre** : seuls les trains (ou la quille pour un avion sans train) touchent en premier.
- **Contact sale** : nez, aile, queue ou fuselage touchent en premier → au minimum ROUGH, souvent CRASH (voir §4).
- **Eau** : segments de type `water`. Tout contact avec l'eau sans flotteurs et hors zone de secours → **WATER CRASH** immédiat.

---

## 3. Paramètres mesurés au contact

| Paramètre | Définition |
|---|---|
| v_v | vitesse verticale au contact, perpendiculaire au sol (positive vers le bas) |
| v_h | vitesse le long du sol |
| Δθ | assiette de l'avion par rapport à la pente du sol (0 = parallèle ; idéal légèrement nez haut) |
| surface | piste, route, parc/pelouse, champ, plage/sable, pente, toit/plateforme |
| zone | désignée (piste, champ balisé, zone de secours…) ou non désignée |
| G | **capacité d'absorption du train** (`gearAbsorb` de la pièce) ; sans train : G = 2,5 (atterrissage sur le ventre) |
| état | pièces déjà endommagées, train arraché, etc. |

---

## 4. Calcul de la qualité

### 4.1 Indice de sévérité

On calcule trois rapports normalisés (1,0 = limite d'un atterrissage « GOOD ») :

  r_v = v_v / (G · f_surface)
  r_a = écart d'assiette hors plage idéale / 10°  (plage idéale : Δθ ∈ [−2°, +10°] ; 0 si dans la plage)
  r_h = v_h / (V_h,max · f_surface)

et l'indice **S = max(r_v, r_a, 0,6·r_h)** (la vitesse horizontale pèse moins : elle se paie surtout au roulage).

Facteurs de surface f_surface (tolérance) :

| Surface | f_surface | Particularité au roulage |
|---|---|---|
| Piste | 1,00 | freinage efficace, roulage long |
| Route large | 0,90 | obstacles latéraux (lampadaires, voitures garées) |
| Parc / pelouse | 0,85 | arbres en bout de zone |
| Champ / prairie | 0,80 | freinage fort (roulage court), légers rebonds |
| Plage / sable | 0,70 | freinage très fort, risque de capotage si vitesse élevée |
| Plateau / pente douce | 0,65 | la pente modifie Δθ |
| Toit / plateforme spéciale | 1,00 | très courte : il faut s'arrêter avant le bord |
| Non atterrissable (falaise, bâtiment, rocher, forêt dense) | — | contact = CRASH |
| Eau | — | contact = WATER CRASH (sauf flotteurs / zone de secours) |

### 4.2 Catégories

| Résultat | Conditions (valeurs de départ) | Conséquences |
|---|---|---|
| **PERFECT LANDING** | Contact propre, **S ≤ 0,5**, dans une **zone désignée**, roulage terminé dans la zone sans toucher d'obstacle, aucune pièce endommagée pendant le vol de l'approche | Bonus de récompense, pilote fier, possible badge |
| **GOOD LANDING** | Contact propre, **S ≤ 1,0**, au plus 1 pièce légèrement abîmée, sortie de zone tolérée de quelques mètres | Vol validé |
| **ROUGH LANDING** | **S ≤ 1,6**, ou contact sale « léger » (bout d'aile, queue) à faible vitesse, ou terrain non désigné mais atterrissable, ou rebonds multiples | Vol validé, avion abîmé, pilote secoué |
| **CRASH LANDING** | S > 1,6, nez en premier (Δθ < −12°), avion retourné à vitesse > 8 u/s, collision majeure, terrain non atterrissable | Récompense partielle, pilote sonné/noirci |
| **WATER CRASH** | Contact eau hors flotteurs/zone de secours | Fin du vol, animation comique, récompense partielle |

Valeurs de départ pour un train standard : G = 6 u/s, V_h,max = 40 u/s. Exemple sur piste : PERFECT si v_v ≤ 3 u/s ; GOOD ≤ 6 ; ROUGH ≤ 9,6 ; au-delà CRASH.

### 4.3 Dépendance aux caractéristiques de l'avion

- **Train** : G varie de 3 (roulettes légères) à 10 (train renforcé), à 2,5 sans train, et un **flotteur** autorise l'eau. C'est le levier principal du joueur sur la tolérance.
- **Vitesse d'approche minimale** : un avion lourd ou à petites ailes décroche plus vite, donc atterrit plus vite : il exige une zone longue. C'est naturel dans la physique ; l'UI de la zone indique « longue » / « courte ».
- **Solidité** (durabilité des pièces) : module la quantité de dégâts au-delà des seuils, pas les seuils eux-mêmes (pour garder des seuils simples à apprendre).
- **Pièces déjà endommagées** : une aile abîmée augmente la vitesse d'approche ; un train arraché fait tomber G à 2,5.

### 4.4 Roulage

Après le contact, l'avion freine selon la surface. Pendant le roulage :
- toucher un obstacle à v > 5 u/s → dégât localisé, note dégradée d'un cran (au plus ROUGH, ou CRASH si l'obstacle est majeur et v > 15 u/s) ;
- sortir de la zone désignée → GOOD au mieux ; dépasser le bord d'un toit ou d'une falaise → chute → CRASH ;
- capotage (Δθ > 60° vers l'avant à cause d'un freinage brutal sur sable/champ) : à basse vitesse → ROUGH « l'avion s'est retourné en douceur » ; sinon CRASH.

### 4.5 Rebonds et remise des gaz

- Un contact avec r_v entre 0,8 et 1,6 provoque un **rebond** proportionnel. Le joueur peut corriger, recontacter, ou **remettre les gaz** et repartir s'il a la vitesse (« touch-and-go »).
- Avant tout contact, le joueur peut toujours **renoncer à une zone et continuer** vers une autre (choix tactique), tant que son énergie (altitude + vitesse + carburant) le permet.

---

## 5. Collisions en vol et dégâts localisés

### 5.1 Énergie d'impact
Pour une collision entre la partie p de l'avion et un obstacle : E = ½·M·v_n² (v_n = vitesse relative normale à la surface touchée).

- E < seuil_léger → éraflure (effet visuel + son, pas d'effet mécanique)
- E < durabilité(p) → **pièce endommagée** (effets mécaniques temporaires, voir PHYSICS_AND_CONTROLS.md §4.4)
- E ≥ durabilité(p) → **pièce détachée** pour ce vol (aile perdue → chute quasi certaine, hélice cassée → plané)
- obstacle « majeur » (bâtiment, falaise, rocher massif) heurté de face par le fuselage → **crash immédiat**

### 5.2 Petits obstacles
Oiseaux, lampadaires, cimes d'arbres, clôtures, panneaux : endommagent sans arrêter le vol. Ils créent la tension comique « l'avion arrive en morceaux mais il arrive ».

### 5.3 Permanence
**Aucun dégât n'est permanent.** Tout est réparé gratuitement en revenant au Hangar. Les dégâts n'ont d'impact qu'à l'intérieur du vol en cours et sur l'évaluation finale. (Une réparation payante ou par pub serait une frustration artificielle : déconseillée.)

### 5.4 Visuel des dégâts
Chaque pièce a au moins 2 états visuels : intacte / endommagée (fissures, bosses, fumée, rubans de scotch). Les pièces détachées deviennent des débris décoratifs (roue qui roule, hélice qui tournoie) sans effet physique.

---

## 6. WATER CRASH et zones de secours

- **Règle absolue** : l'eau n'est jamais une piste. Contact eau → WATER CRASH, quelle que soit la douceur de l'amerrissage.
- **Exceptions explicites uniquement** :
  1. **Flotteurs** (pièce de train spéciale, déblocage tardif) : autorisent un amerrissage jugé comme une surface avec f_surface = 0,75, mais **un amerrissage ne valide jamais la destination** (on est « au large de Douvres », pas à Londres). À arbitrer avec le design : les flotteurs peuvent ouvrir des destinations insulaires.
  2. **Zones de secours** balisées (barge, plateforme flottante, banc de sable, petite île) : toujours signalées par un drapeau/bouée et une icône HUD dès qu'elles sont à moins de ~2 écrans.
- Le WATER CRASH a sa propre animation (plouf, pilote qui remonte avec une bouée canard) et ses textes.

---

## 7. Zones d'atterrissage et génération de l'approche

### 7.1 Structure d'une étape

```
DÉPART ─────────── CROISIÈRE (événements) ─────────── APPROCHE ──── DESTINATION
piste           zones de secours ponctuelles          ≈ derniers 20–25 % de l'étape
```

Les étapes sont **construites à la main** avec quelques paramètres variables (vent, anneaux), pas générées aléatoirement. L'aléatoire pur produit des situations injustes, alors que l'atterrissage doit s'apprendre.

### 7.2 Le choix tactique de l'approche

Chaque destination propose **au moins 3 options** visibles depuis le début de l'approche (la caméra dézoome) :

| Option | Exemple (Londres) | Difficulté | Valide la destination ? | Bonus |
|---|---|---|---|---|
| **Sûre mais en deçà** | grand champ avant la ville | facile, longue, pas d'obstacle | **Oui** (zone de destination « périphérique ») | faible |
| **Standard** | aérodrome, piste longue après une rangée d'arbres | moyenne | Oui | normal |
| **Audacieuse** | parc au centre, ou toit-plateforme | courte, entourée d'obstacles | Oui | élevé (+ badges) |
| **Hors zone** | n'importe quel terrain atterrissable avant | variable | **Non** | distance seulement |

Proposition à valider avec le design et l'économie : **la destination est atteinte** pour un PERFECT/GOOD/ROUGH dans n'importe quelle zone désignée de la destination ; un atterrissage réussi ailleurs est récompensé (distance + qualité) mais ne débloque pas l'étape suivante.

### 7.3 Règles d'équité (non négociables)

1. **Télégraphie** : tout obstacle est visible **≥ 3 s avant** d'être atteint à vitesse de croisière. En approche, la caméra **dézoome** pour montrer la zone et ses obstacles en entier.
2. **Rien n'apparaît** dans les 3 dernières secondes avant l'avion. Pas d'apparition aléatoire.
3. Les obstacles **mobiles** (voitures, bateaux, oiseaux) suivent des **trajectoires prévisibles** et répétées.
4. Les zones désignées sont **balisées** (manche à air, marquages, drapeaux) et indiquées dans le HUD : nom, longueur (courte/longue), surface, distance.
5. **Ligne de trajectoire prévue** en approche (voir contrôles) : le joueur voit où il va toucher.
6. Toute étape doit être **réussissable** avec l'avion de référence débloqué à ce stade, dans au moins une zone désignée — vérifié par un test (vol scripté) dans la CI à terme.
7. Le vent en approche est **annoncé** (manche à air + flèche HUD) et constant ou en rafales régulières, jamais un coup unique imprévisible.

### 7.4 Zones de secours en croisière

Sur les étapes longues ou au-dessus de la mer : au moins une zone de secours toutes les ~30–40 s de vol, signalée. Elle permet de « sauver » un vol raté (récompense de distance + atterrissage) plutôt que de finir dans l'eau sans choix.

---

## 8. Données transmises à l'écran de résultats

| Donnée | Source |
|---|---|
| Ville de départ, destination visée | définition de l'étape |
| Distance parcourue (km affichés) | x_final − x_départ, × facteur d'échelle de l'étape |
| **Distance à la destination** | \|x_destination − x_final\| × facteur d'échelle ; si zone de destination : « À destination » ; sinon « Dans un champ à 15 km de Londres » (type de terrain + distance) |
| Durée, altitude max, vitesse max | enregistrement pendant le vol |
| Zone d'atterrissage | nom de la zone ou type de terrain |
| Qualité d'atterrissage | catégorie §4.2 |
| État de l'avion | liste des pièces endommagées/détachées → illustration |
| État du pilote | dérivé de la catégorie + événements (fumée, eau, retournement) → couches visuelles d'effets temporaires |
| Événements notables | anneaux, ascendances utilisées, obstacles évités, décrochages rattrapés (pour badges/défis) |

Correspondance indicative résultat → état du pilote (à finaliser avec PILOT_CHARACTER.md) : PERFECT → pleine forme/fier ; GOOD → décoiffé ; ROUGH → secoué, casque de travers ; CRASH → sonné, noirci ; WATER → trempé, bouée.

---

## 9. Tests et réglage

- **Table de vérité** automatisée : ~50 cas (v_v, v_h, Δθ, surface, train) → catégorie attendue. Toute modification des seuils doit garder cette table verte ou la mettre à jour consciemment.
- **Vols scriptés** par étape : vérifier qu'une zone désignée au moins est atteignable avec l'avion de référence.
- **Télémétrie locale** pendant les tests de jeu (en développement uniquement) : distribution des résultats par étape. Cible indicative pour une étape « normale » chez un joueur moyen : ~15 % PERFECT, ~40 % GOOD, ~25 % ROUGH, ~20 % CRASH/WATER. À confirmer avec DIFFICULTY_BALANCING.md.

---

## 10. Points ouverts

- Validation de la destination par la zone « sûre en deçà » : rend l'étape facile à finir pour tous, mais réduit la tension ? Recommandation : oui, valide, avec bonus faible — l'audace doit être récompensée, pas obligatoire.
- Flotteurs : à inclure au MVP seulement si une destination insulaire en a besoin.
- Toits / plateformes : spectaculaires mais coûteux en level design ; 1–2 au total au MVP.
