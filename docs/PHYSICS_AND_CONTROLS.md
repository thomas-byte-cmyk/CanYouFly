# Physique de vol et contrôles — CAN YOU FLY?

> Statut : **proposition de conception (Phase 1)**. Auteur : Agent 1 — Game Development.
> Les formules ci-dessous décrivent le modèle ; les valeurs numériques sont des **points de départ d'équilibrage**, pas des valeurs finales.
> Liés : [TECHNICAL_ARCHITECTURE.md](TECHNICAL_ARCHITECTURE.md), [LANDING_AND_CRASH_SYSTEM.md](LANDING_AND_CRASH_SYSTEM.md).

---

## 1. Objectif du modèle

Le modèle doit satisfaire trois exigences, dans cet ordre :

1. **Lisible** : le joueur sent la conséquence de sa construction en moins de 5 secondes de vol (« mon avion cabre tout seul, j'ai mis l'aile trop en avant »).
2. **Amusant** : un avion bancal vole quand même, mal, de façon comique et maîtrisable ; un avion bien construit est agréable, pas automatique.
3. **Crédible dans ses principes** : portance, traînée, poussée, gravité, centre de gravité, décrochage existent et se comportent dans le bon sens. Pas de simulation réaliste au-delà.

Choix fondamental : **l'avion est un seul corps rigide 2D**. État : position (x, y), vitesse (vₓ, v_y), assiette θ (angle du nez par rapport à l'horizontale), vitesse angulaire ω. Intégration à pas fixe Δt = 1/60 s.

---

## 2. Grandeurs agrégées issues de la construction

Calculées une fois dans le Hangar (et recalculées si une pièce est endommagée en vol). Ce sont **les mêmes valeurs** que celles affichées au joueur.

Notation : chaque pièce i a une masse mᵢ et une position xᵢ le long de l'axe de l'avion (x croissant vers le nez), obtenue par la position du slot + le centre de masse local de la pièce.

**Masse totale** (carburant inclus, il diminue en vol) :

  M = Σ mᵢ + m_carburant(t)

**Centre de gravité** :

  x_CG = ( Σ mᵢ·xᵢ + m_carburant·x_réservoir ) / M

→ le CG **se déplace pendant le vol** quand le réservoir se vide. Effet volontaire et lisible si le réservoir est loin du CG (un défi de construction de plus), négligeable si bien placé.

**Surfaces portantes** : aile principale (W), canard (C, optionnel), empennage horizontal (H). Chacune a une surface Sₖ, une pente de portance aₖ, un angle de décrochage α_stall,k, une position xₖ.

**Point neutre** (centre de portance global en régime linéaire) :

  x_NP = Σ (aₖ·Sₖ·xₖ) / Σ (aₖ·Sₖ)

**Marge statique** (normalisée par une corde de référence c) :

  SM = (x_CG − x_NP) / c

- SM > 0 (CG devant le point neutre) : **stable**, l'avion revient de lui-même vers son assiette d'équilibre ; trop grand → l'avion est « lourd du nez », il pique et répond mollement.
- SM ≈ 0 : neutre, très réactif, demande des corrections constantes.
- SM < 0 : **instable**, le moindre cabrage s'amplifie : l'avion cabre (ou pique) tout seul.

Plage visée par l'équilibrage : SM idéale ≈ 0,05 à 0,15 ; jouable mais « nerveux » entre −0,05 et 0,05 ; « pataud » entre 0,15 et 0,35 ; au-delà, très difficile mais pas impossible (un avion extrême doit rester un défi drôle, pas un bug).

**Autres agrégats** : traînée parasite D₀ = Σ dragAreaᵢ ; poussée max T_max (moteur × efficacité de l'hélice associée) ; consommation ; capacité carburant ; autorité en tangage P = Σ pitchAuthority (gouvernes, empennages) ; amortissement K_d = Σ damping ; inertie en tangage I = Σ mᵢ·(xᵢ − x_CG)² + I₀.

---

## 3. Forces en vol

Soit V = ‖v‖ la vitesse, γ = atan2(v_y, vₓ) l'angle de la trajectoire, et **l'angle d'attaque** de la surface k :

  αₖ = θ − γ + iₖ    (iₖ = calage de la surface, en général 2–4° pour l'aile, ~0 pour l'empennage)

Pression dynamique « arcade » : q = ½·ρ·V² (ρ constante ; on pourra la faire décroître doucement avec l'altitude pour créer un plafond naturel).

### 3.1 Portance (perpendiculaire à la vitesse)

  Lₖ = q · Sₖ · C_L,k(αₖ)

Courbe de portance simplifiée par morceaux :
- |α| ≤ α_stall : C_L = a·α (linéaire)
- au-delà : C_L chute vers ~40 % de sa valeur max en ~5° puis reste plate (**décrochage doux**, rattrapable)

### 3.2 Traînée (opposée à la vitesse)

  D = q · ( D₀ + k_i · Σ Sₖ·C_L,k² + D_dégâts + D_train_sorti )

Le terme induit k_i·C_L² punit les grandes incidences : voler lentement « en cabrant » coûte de l'énergie. D₀ grandit avec les grosses ailes, les gros moteurs et les accessoires.

### 3.3 Poussée (dans l'axe de l'avion, angle θ)

  T = T_max · u_gaz · η(V) · (carburant > 0 ? 1 : 0)

avec u_gaz ∈ [0, 1] (manette des gaz) et η(V) = max(0, 1 − V / V_max_hélice) : une hélice « petite et rapide » perd peu en vitesse, une grande hélice tracte fort au décollage mais plafonne vite. C'est ce qui donne un vrai choix entre hélices.

### 3.4 Gravité

  P = M · g, vers le bas. g arcade ≈ 9,8 unités/s² (à régler pour la sensation).

### 3.5 Bilan de translation

  M · dv/dt = T + Σ Lₖ + D + P

### 3.6 Rotation (tangage)

Moment autour du CG (positif = cabrer) :

  M_θ = Σ Lₖ·(xₖ − x_CG) + M_commande + M_moteur − K_d·ω·q_eff

- Σ Lₖ·(xₖ − x_CG) contient **toute la stabilité** : une surface devant le CG cabre l'avion quand elle porte plus, une surface derrière le rappelle. C'est ce terme qui rend la construction lisible.
- **M_commande = u_tangage · P · q_eff** avec u_tangage ∈ [−1, 1] et q_eff = max(q, q_min) : les gouvernes sont plus efficaces à grande vitesse, mais gardent un minimum d'efficacité pour que le joueur ne soit jamais impuissant (choix arcade assumé).
- M_moteur : petit couple si le moteur est décalé verticalement (option pour certaines pièces exotiques, sinon 0).
- K_d·ω : amortissement, évite les oscillations infinies ; augmente avec l'empennage.

  I · dω/dt = M_θ

### 3.7 Équilibrage (« trim ») automatique

Pour éviter qu'un avion correct ne demande de tenir la touche en permanence, un **trim automatique** calcule au décollage la commande qui équilibre l'avion en palier à la vitesse de croisière de référence, dans la limite de ±30 % de l'autorité. Conséquence voulue :
- avion équilibré → les mains libres, il vole droit ;
- avion déséquilibré au-delà de ce que le trim peut compenser → il dérive (cabre/pique) et le joueur doit corriger : **c'est la signature visible d'une mauvaise construction**.

---

## 4. Régimes particuliers

### 4.1 Décollage
- Au sol : poussée − traînée − friction du train (dépend de la surface : piste < herbe < sable).
- Le joueur cabre ; l'avion quitte le sol quand ΣL > P. **Vitesse de décollage estimée** V_dec ≈ √( 2·M·g / (ρ·S_tot·C_L,max·0,8) ), affichée dans le Hangar.
- Sans train d'atterrissage : départ par **rampe/catapulte** (pas de roulage). Décision à valider avec le design : la rampe simplifie aussi le premier vol du tutoriel.
- Si la piste se termine avant le décollage : l'avion tombe au bout de la piste → résultat comique, récompense minimale, conseil explicite (« Trop lourd ! Essaie un moteur plus puissant ou une aile plus grande »).

### 4.2 Panne sèche
Carburant = 0 → T = 0, l'hélice ralentit visuellement, son de moteur qui toussote. L'avion devient un **planeur** : il garde le contrôle en tangage. La distance planée dépend de la finesse ≈ L/D max. Un avion à grandes ailes plane loin ; un avion « fusée » tombe. C'est l'un des choix stratégiques majeurs (carburant vs finesse).

### 4.3 Décrochage
Si α_aile > α_stall : portance de l'aile chute, alarme (vibration de l'écran légère, pilote paniqué, son de sifflet). Si le CG est devant le point neutre, l'avion **pique naturellement** et récupère de la vitesse : rattrapable en relâchant. Si SM < 0, le décrochage peut entraîner une vrille comique (rotation) : rattrapable avec de l'altitude, fatal près du sol.

### 4.4 Effet des dégâts en vol (temporaire, pour ce vol uniquement)

| Pièce endommagée | Effet sur le modèle |
|---|---|
| Aile | S_W × 0,7, D₀ + 15 %, petite oscillation visuelle |
| Empennage horizontal | P × 0,6, K_d × 0,5 → avion « dansant » |
| Hélice cassée | T = 0 (plané forcé) |
| Moteur touché | T × 0,6, poussée intermittente (toux), fumée |
| Train arraché | atterrissage sur le ventre : seuils durcis, voir doc atterrissage |
| Réservoir percé | fuite : consommation × 2 |
| Accessoire | perdu pour ce vol, effet retiré |

Les dégâts **ne modifient jamais l'inventaire du joueur** : à la fin du vol, l'avion est réparé gratuitement au Hangar.

---

## 5. Vent et événements (interface physique)

Les événements de vol (définis par le game design) agissent uniquement via quelques entrées physiques, pour rester cohérents et testables :
- **Vent** w (vecteur) : la vitesse air devient v_air = v − w (portance et traînée utilisent v_air). Vent arrière = gain de distance gratuit ; vent de face = coûte du carburant.
- **Ascendance / courant descendant** : force verticale ajoutée dans une zone.
- **Rafale / turbulence** : impulsion sur ω (petite, prévisible : bruit lissé, jamais un coup aléatoire qui plante l'avion au sol sans réaction possible).
- **Boost** : poussée supplémentaire temporaire.
- **Anneau** : pas d'effet physique (récompense) sauf variante « anneau boost ».

Chaque zone d'événement est **visible avant d'y entrer** (nuages, flèches, oiseaux, drapeaux) : voir règles d'équité dans [LANDING_AND_CRASH_SYSTEM.md](LANDING_AND_CRASH_SYSTEM.md).

---

## 6. Contrôles

### 6.1 Ce que le joueur contrôle
1. **Tangage** (cabrer / piquer) — commande principale, en permanence.
2. **Gaz** (puissance moteur) — commande secondaire, utilisée à des moments clés (décollage, économie de carburant, approche).
3. **Aucune autre commande** au lancement. Pas de volets, pas d'aérofreins, pas de roulis (le jeu est en 2D). Le freinage au sol est automatique après le contact.

Pourquoi les gaz et pas seulement le tangage ? Parce que la gestion du carburant et la vitesse d'approche sont deux des décisions les plus intéressantes (et sans gaz, l'atterrissage se réduit à « piquer moins »). Mais les gaz doivent rester **optionnels pour un débutant** (voir assistance).

### 6.2 Schéma clavier (desktop)

| Action | Touches |
|---|---|
| Cabrer | ↑ ou W |
| Piquer | ↓ ou S |
| Plus de gaz | → ou D (maintien = monte progressivement) |
| Moins de gaz | ← ou A |
| Couper / remettre le moteur (bascule rapide) | Shift |
| Pause | Échap (et P) — exigence Poki : Échap ou Espace pour pause |
| Lancer le décollage (Hangar → vol) | Entrée / Espace |

Les flèches et Espace ont leur défilement de page bloqué (exigence Poki).

Commande de tangage : touche maintenue → u_tangage monte vers ±1 en ~0,15 s (rampe courte, pour éviter les à-coups), relâchée → retour à 0 (le trim tient l'avion).

### 6.3 Schéma tactile (mobile/tablette) — recommandation

```
┌───────────────────────────────────────────────────────────┐
│ [⏸]                  HUD (distance, carburant)            │
│                                                           │
│  ┃▲┃                                                      │
│  ┃█┃ ← manette des gaz            zone droite :           │
│  ┃ ┃   (curseur vertical,         POUCE = MANCHE           │
│  ┃▼┃    pouce gauche)             glisser ↑ = cabrer       │
│                                   glisser ↓ = piquer       │
│                                   relâcher = neutre        │
└───────────────────────────────────────────────────────────┘
```

- **Moitié droite = manche analogique relatif** : on pose le pouce n'importe où, l'écart vertical par rapport au point de contact donne u_tangage (saturation à ~60 px). Pas de cible précise à viser : robuste sur tous les écrans.
- **Gauche = manette des gaz** sous forme de curseur vertical persistant (la valeur reste quand on lâche), avec un cran « 100 % » et un cran « 0 % ».
- Alternative testée en prototype : **deux gros boutons ▲ ▼** à droite (plus simple, identique au clavier, mais moins fin). On tranchera par test utilisateur ; le prototype implémentera les deux derrière un réglage.
- Pas de contrôle par inclinaison du téléphone (gyroscope) au lancement : peu fiable, inconfortable, permissions iOS. Éventuellement en option plus tard.

### 6.4 Aides au pilotage

| Aide | Description | Par défaut |
|---|---|---|
| **Gaz automatiques** | Le jeu gère la manette (plein gaz au décollage, réduit en croisière pour économiser, ralenti en approche). Le joueur peut reprendre la main à tout moment. | Activé pour les 3 premiers vols, puis proposé |
| **Stabilisation douce** | Ajoute un amortissement supplémentaire et un rappel léger vers l'assiette de vol plané idéale quand le joueur ne touche à rien. Réduit (sans supprimer) les défauts de construction. | Activé au début, désactivable (badge « sans assistance » pour les experts) |
| **Ligne de trajectoire prévue** | Pointillés projetant la trajectoire sur ~3 s (calculée avec le même modèle physique, commandes neutres). Indispensable à l'approche. | Activé pendant l'approche |
| **Indicateur de décrochage** | Vibration, son, visage du pilote | Toujours |
| **Indicateur d'approche** | Flèche vers la zone d'atterrissage et pastille de couleur (vitesse verticale OK / trop rapide) | Toujours en approche |

### 6.5 Courbe d'apprentissage

1. **Vol 1** (tutoriel intégré, sans texte long) : avion préassemblé équilibré, gaz automatiques, une seule consigne à la fois : « Maintiens ▲ pour décoller », « Relâche pour voler droit », « Descends doucement vers la piste ».
2. **Vol 2–3** : premier changement de pièce imposé (aile plus grande) pour montrer qu'une pièce change le vol.
3. **Vol 4+** : gaz manuels proposés (« Prends les commandes du moteur pour aller plus loin »).
4. Plus tard : vent, obstacles d'approche, zones exigeantes. Un concept nouveau par étape, jamais deux.

---

## 7. Rendre la construction lisible

Le joueur ne lit pas de chiffres ; il doit **voir** et **sentir**.

**Dans le Hangar :**
- Deux marqueurs sur l'avion : **●CG** (centre de gravité) et **▲CP** (centre de portance / point neutre). Une jauge d'équilibre « Nez lourd ◄── Équilibré ──► Queue lourde » avec la zone idéale en vert.
- 4–5 barres de statistiques lisibles plutôt que 8 chiffres : **Décollage** (rapport poussée/poids et vitesse de décollage), **Vitesse**, **Autonomie** (carburant × consommation), **Plané** (finesse), **Stabilité** (marge statique + amortissement), **Solidité** (durabilité + train).
- Comparaison avant/après à chaque pièce survolée (flèches vertes/rouges).
- Avertissements explicites et drôles : « Cet avion va cabrer tout seul », « Trop lourd pour décoller de cette piste », « Pas de train : décollage à la catapulte ».
- Vérification au décollage : on bloque seulement les constructions impossibles (pas d'aile, pas de propulsion ni de rampe) ; tout le reste est autorisé, avec avertissement.

**En vol :**
- L'avion déséquilibré **montre** sa tendance : nez qui monte tout seul, oscillations, vibrations des pièces. Le pilote réagit (crispé si instable, endormi si l'avion est stable et lent).
- Au résultat, un **conseil unique et ciblé** tiré du vol (« Ton avion manquait de vitesse à l'approche : essaie une hélice plus grande »).

---

## 8. Valeurs de départ (avion de référence équilibré)

| Grandeur | Valeur indicative |
|---|---|
| Masse | 300 u (dont 40 de carburant) |
| Vitesse de décollage | ~22 u/s |
| Vitesse de croisière | ~45 u/s |
| Vitesse max | ~70 u/s |
| Finesse max (L/D) | ~8 |
| Autonomie plein gaz | ~60 s, ~90 s à gaz réduits |
| Longueur d'une étape | 3 000–6 000 u → 60–150 s de vol (aligné sur le cadre) |
| Plafond doux | ~600 u d'altitude |

La conversion « distance de jeu → kilomètres affichés » est un **facteur d'échelle par étape** (ex. 1 u = 0,08 km pour Paris–Londres) : le joueur lit des distances crédibles (« à 15 km de Londres ») sans que les distances réelles contraignent le gameplay.

---

## 9. Risques et points ouverts

- **Le principal risque du projet est ici** : une physique correcte peut être ennuyeuse ou frustrante. Mitigation : prototype de vol en tout premier (avant le Hangar), réglages en données, panneau de debug, tests de jeu dès la 1re semaine.
- Le choix « gaz manuels » vs « tangage seul » doit être validé par test ; le modèle supporte les deux (gaz automatiques).
- Le CG qui bouge avec le carburant est intéressant mais peut être perçu comme injuste : à garder faible par défaut et à mettre en évidence par l'interface.
- Contrôle tactile : manche relatif vs boutons, à trancher par test sur vrais appareils.
