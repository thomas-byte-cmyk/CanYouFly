# DIRECTION ARTISTIQUE — CAN YOU FLY?

> Statut : **proposition Phase 1** — le choix de la piste artistique nécessite la validation de l'utilisateur.
> Responsable : Agent 2. Liés : `PILOT_CHARACTER.md`, `CUSTOMIZATION_SYSTEM.md`, `WORLD_MAP.md`, `AUDIO_DESIGN.md`.

---

## 1. Objectif

Être reconnaissable **sur une vignette de 200 × 200 px** au milieu de centaines de jeux Poki, et lisible sur un téléphone de 5 pouces en plein vol. Le style doit être *produisible* par une très petite équipe (nous + éventuellement un freelance), donc fondé sur des formes simples et réutilisables.

Le piège à éviter : le « cartoon vectoriel plat générique » (dégradés de ciel bleu, nuages ronds blancs, avions en clip-art) qu'on voit dans 80 % des jeux d'avion HTML5.

---

## 2. Deux pistes

### Piste A — « Atelier du Dimanche » (RECOMMANDÉE)
Des avions bricolés dans un garage : bois, tôle rivetée, scotch, ficelle, objets détournés (baignoire, ventilateur, parasol). Ambiance **rétro-années 50/60 optimiste** (affiches de voyage, cartes postales), mais traitement **moderne** : contours épais, couleurs franches, ombrage en 2 tons.

- **Pourquoi** : le concept *est* le bricolage. Le style justifie les pièces absurdes, rend les dégâts drôles (une planche qui se décroche, un rivet qui saute) et donne une identité forte aux miniatures. Les affiches de voyage rétro servent naturellement la carte du monde et les écrans de résultats (« carte postale de Rome »).
- **Risque** : glisser vers le « vieillot ». Parade : palette saturée, animations très élastiques, UI moderne.

### Piste B — « Jouet Pop »
Tout ressemble à des jouets en vinyle : formes très arrondies, aucun contour, couleurs bonbon, éclairage doux.

- **Pour** : très familial, très lisible, facile à produire.
- **Contre** : extrêmement répandu sur mobile/Poki, peu de matière pour l'humour du bricolage, les pièces se ressemblent toutes (des blobs colorés). Faible différenciation.

**Recommandation : Piste A**, avec l'emprunt à B de la rondeur des personnages (le pilote reste mignon, pas rétro-réaliste).

---

## 3. Grammaire visuelle (Piste A)

### 3.1 Formes
- **Avions et pièces** : formes rectangulaires/trapézoïdales légèrement *de travers* (rien n'est parfaitement droit, comme un objet fait main). Rivets, planches, rustines comme motifs récurrents.
- **Personnages** : formes rondes et douces (contraste avec les avions anguleux → le pilote ressort toujours).
- **Décors** : formes simplifiées en aplats, silhouettes iconiques des villes (Tour Eiffel, Big Ben, moulins, Colisée…).

### 3.2 Contours
- **Contour brun très foncé (#2B1D14), pas noir pur**, épaisseur **4 px** à l'échelle 1× pour les éléments de gameplay (avion, obstacles, zones), **2 px** pour les décors de second plan, **aucun contour** pour l'arrière-plan lointain. → la hiérarchie de lisibilité est portée par le trait.

### 3.3 Palette (indicative)
| Rôle | Couleurs |
|------|----------|
| Ciel jour | dégradé en 2–3 bandes franches (pas de dégradé lisse) : #8FD3F4 → #CFEFFF |
| Avion par défaut | rouge brique #D94F30, crème #F3E3C3, bois #B07A47 |
| Bonus / positif | or #FFC83D |
| Danger | gris-violet #6B5B8C, rouge alerte #E8433A |
| Zone d'atterrissage sûre | vert #5BC26A + damier blanc |
| Eau | bleu canard #2E8FA5 avec écume blanche (jamais confondable avec une zone d'atterrissage) |
| UI | crème #FFF4DC, brun #2B1D14, accents orange #FF8A2A |

Chaque biome a une palette dérivée (voir §5), mais **les couleurs de gameplay (or, gris-violet, vert, eau) sont fixes partout**.

### 3.4 Lisibilité mobile
- L'avion occupe **≥ 12 % de la hauteur d'écran** en croisière.
- Test « silhouette » : chaque pièce doit être reconnaissable en noir sur blanc. Si deux pièces d'une même catégorie ont la même silhouette, l'une est redessinée.
- Contraste fond/avant-plan : arrière-plans désaturés de 30 %, avant-plan saturé.
- Aucun texte de gameplay en vol hors HUD minimal (vitesse verticale, carburant, distance).

---

## 4. Style des pièces

- Chaque pièce = **1 sprite principal + 1 à 2 variantes d'endommagement** (abîmé, cassé) + éventuelles parties animées (hélice).
- Points d'attache dessinés (petite plaque rivetée) pour que le snap paraisse physique.
- Les stats se lisent à la forme : grandes ailes = longues et fines, moteur puissant = gros et chromé avec pots d'échappement, pièce légère = ajourée.
- Tailles normalisées par slot (grille de 32 px à l'échelle 1×) pour que toutes les combinaisons s'assemblent sans trou.

---

## 5. Environnements par biome

Chaque étape = 3–4 couches de parallaxe : ciel, fond lointain (silhouettes), plan moyen (collines/ville), plan de jeu (sol, obstacles, zones).

| Biome | Palette dominante | Marqueurs | Obstacles typiques |
|-------|-------------------|-----------|--------------------|
| Campagne | verts tendres, ocre, toits rouges | champs en patchwork, moulins | clôtures, arbres, granges, éoliennes |
| Ville | crème, gris chauds, bleu ardoise | monument de la ville, toits | bâtiments, lampadaires, grues, véhicules garés |
| Littoral / îles | turquoise, sable, blanc | phares, voiliers | falaises, rochers, palmiers |
| Montagne | bleus froids, blanc, vert sapin | chalets, téléphériques | pics, sapins, câbles |
| Polder / canaux (Amsterdam) | vert, brique, bleu | moulins, canaux, tulipes | canaux (eau !), péniches, ponts |

Éléments récurrents d'ambiance (peu coûteux, très efficaces) : oiseaux, linge qui sèche, montgolfières au loin, vaches qui regardent l'avion passer.

---

## 6. Effets visuels (VFX)

Priorité : **feedback de gameplay d'abord, joliesse ensuite.**

| Effet | Usage | Technique suggérée |
|-------|-------|--------------------|
| Fumée moteur | panne, surchauffe, crash | particules sprites (3 frames de nuage) |
| Éclats / planches / rivets | collisions | particules + débris physiques simples |
| « Boing » / ressorts | rebonds, train à ressorts | squash & stretch de l'avion |
| Lignes de vitesse | boost, piqué | sprites étirés |
| Étoiles / oiseaux qui tournent | pilote sonné | anim sur la tête du pilote |
| Gerbe d'eau géante | WATER CRASH | sprite animé 6–8 frames + gouttes |
| Poussière / herbe | contact au sol | particules |
| Tampon des résultats | écran résultats | tween scale + shake |
| Screen shake | impacts (calibré, option de réduction) | caméra |

Option d'accessibilité : **réduire les secousses d'écran** (réglages).

---

## 7. Interface (UI)

- **Typo titre** : une display rétro arrondie et épaisse (type « Lilita One » ou « Baloo 2 », licence OFL, à vérifier). **Typo texte** : sans-serif ronde lisible (« Nunito », OFL). Maximum 2 polices, sous-ensemble de glyphes (latin) pour limiter le poids.
- **Boutons** : formes de plaques rivetées avec relief (enfoncement au tap), tailles **≥ 48 px** (min 44 px), espacement ≥ 8 px.
- **HUD en vol** : minimal — barre carburant (bidon), indicateur de vitesse verticale (aiguille colorée vert/orange/rouge pendant l'approche), distance restante (petit avion sur une ligne). Placé dans les coins hauts, loin des zones de pouce.
- **Zones tactiles de pilotage** : invisibles mais signalées au tutoriel ; on n'y met jamais de bouton.
- **Langue** : icônes autant que possible ; textes courts (localisation EN/FR au minimum, prévoir +30 % de longueur).

---

## 8. Animations clés

| Animation | Importance | Notes |
|-----------|-----------|-------|
| Hélice | Critique | 3–4 frames + flou de rotation à haut régime |
| Avion « vivant » au sol | Haute | légères vibrations moteur, ressorts du train |
| Squash & stretch au décollage et à l'impact | Haute | déformation de l'avion entier par tween |
| Pièces qui se détachent | Haute | la pièce devient un débris physique |
| Pilote (visage, tête, bras) | Critique | cf. `PILOT_CHARACTER.md` |
| Assemblage au hangar | Moyenne | la pièce « tombe » en place avec rebond + poussière |
| Carte du monde | Moyenne | tracé en pointillés qui avance, tampon de ville |

**Technique recommandée : animation « cut-out » par tweens** (pièces découpées animées par Phaser : rotation, échelle, position) plutôt qu'un outil squelettique (Spine : licence payante, pipeline plus lourd) ou des sprite-sheets frame par frame (poids). Le frame par frame est réservé à quelques effets (gerbe d'eau, fumée).

---

## 9. Contraintes de production (réalisme)

### 9.1 Formats
- Assets produits en **vectoriel** (Figma / Inkscape / Affinity), exportés en PNG à **2×** puis empaquetés en **atlas** (TexturePacker ou équivalent libre), WebP quand possible avec repli PNG.
- Budget indicatif : **≤ 3 atlas de 2048×2048** au premier chargement (hangar + 1er biome + UI), biomes suivants chargés à la demande.

### 9.2 Qui produit les assets ? (avis franc)
| Option | Qualité / cohérence | Coût | Avis |
|--------|---------------------|------|------|
| **Asset packs libres (Kenney, CC0)** | Correcte mais générique | Gratuit | **Parfait pour le prototype** (placeholders), insuffisant pour la sortie. |
| **IA générative d'images** | Belles images isolées, **cohérence de style et découpage en pièces difficiles**, droits/licences à vérifier selon l'outil | Faible | Utile pour **concept art et moodboards**, risqué pour les assets finaux sans retouche importante. Poki n'interdit pas l'IA à notre connaissance, mais la qualité « assemblable » n'y est pas. |
| **Freelance illustrateur 2D jeu** | Cohérent, identité forte | Estimation grossière : 1 500–4 000 € pour pilote + ~45 pièces + 3 biomes + UI | **Recommandé pour le MVP** si budget disponible. |
| **Production maison en vectoriel simple** | Dépend du temps disponible | Temps | Possible car la Piste A repose sur des formes simples ; c'est aussi notre plan B. |

> **Décision D9 (13/11/2026)** : **zéro budget pour l'instant.** Prototype et MVP en packs libres (Kenney…), formes maison et IA pour le concept art, dans le style Piste A. Un investissement freelance sera envisagé uniquement si le jeu reçoit de bons retours (après le go / no-go ou la publication). **Décision D8 : Piste A « Atelier du Dimanche » validée.**

**Recommandation initiale** : prototype en placeholders (formes géométriques + Kenney) pour valider le *fun* sans investir ; style board de la Piste A (concept art IA + retouche) pour validation ; puis décision budget freelance avant le MVP.

### 9.3 Ce qui est cher et doit être limité
- Variantes d'endommagement : 1 seule variante « abîmée » par pièce (le « cassé » = la pièce se détache).
- Monuments : 1 par ville, réutilisés en carte postale.
- Pilote : modulaire (voir `CUSTOMIZATION_SYSTEM.md`) pour multiplier les combinaisons sans multiplier les dessins.

## 10. Décisions

> 1 → **Piste A validée** (D8). 2 → **zéro budget pour l'instant** (D9).

1. Piste A « Atelier du Dimanche » vs Piste B « Jouet Pop ».
2. Stratégie de production : placeholders au prototype, freelance (budget ?) ou maison pour le MVP.
