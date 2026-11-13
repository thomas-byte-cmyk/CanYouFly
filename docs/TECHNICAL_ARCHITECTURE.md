# Architecture technique — CAN YOU FLY?

> Statut : **proposition de conception (Phase 1)** — à valider avant tout développement.
> Auteur : Agent 1 — Game Development. Aucun code applicatif n'est produit à ce stade.
> Documents liés : [PHYSICS_AND_CONTROLS.md](PHYSICS_AND_CONTROLS.md), [LANDING_AND_CRASH_SYSTEM.md](LANDING_AND_CRASH_SYSTEM.md).

---

## 1. Principes directeurs

1. **Simple avant tout.** Un seul langage, un seul moteur, zéro backend, zéro dépendance « magique ».
2. **La simulation est à nous, le rendu est au moteur.** La physique de vol est le cœur du plaisir : elle doit être déterministe, testable hors navigateur et réglable par des données.
3. **Les données pilotent le jeu.** Pièces, étapes, zones d'atterrissage, seuils et économie vivent dans des fichiers de données (JSON), pas dans la logique. On équilibre sans recompiler la logique.
4. **Mobile d'abord pour la performance, desktop d'abord pour le confort de dev.** On teste sur un Android d'entrée de gamme dès le prototype.
5. **Poki dès le début.** Cycle de vie SDK, son, pause, taille de build : pensés dès le prototype, même si l'intégration complète arrive au MVP.

---

## 2. Choix du moteur

### 2.1 Options évaluées

| Option | Pour | Contre | Verdict |
|---|---|---|---|
| **Phaser 3 + TypeScript + Vite** | Moteur 2D mature, très répandu sur le web, scènes, tweens, caméra, input tactile, audio, chargement d'assets intégrés ; plugin Poki officiel pour Phaser ; énorme corpus d'exemples (utile pour un dev assisté par IA) ; build léger (~1 Mo minifié, ~250–350 Ko gzip) | API parfois verbeuse ; Phaser 4 en cours de maturation (migration éventuelle à surveiller, non bloquante) | **Recommandé** |
| PixiJS + code maison | Rendu très performant, plus léger | Il faut tout réécrire : scènes, input, audio, chargement, UI. Temps perdu sans valeur joueur | Rejeté |
| Godot / Unity export web | Éditeurs puissants | Builds web lourds (Unity : gros blob WebAssembly à télécharger en entier avant de jouer, ce que Poki souligne lui-même), démarrage lent sur mobile, mauvaise conversion « clic → jeu » | Rejeté pour ce projet |
| Cocos Creator / Construct 3 / GDevelop | Outils visuels | Moins adaptés à une simulation sur mesure testée unitairement ; dépendance à un éditeur | Rejeté |

**Recommandation : Phaser 3 (dernière version 3.x stable au démarrage du dev) + TypeScript strict + Vite.**

### 2.2 Physique : Matter.js ou physique maison ?

| Critère | Matter.js (intégré à Phaser) | Physique de vol maison |
|---|---|---|
| Aérodynamique (portance, traînée, angle d'attaque) | Absente — à coder par-dessus de toute façon | Native, c'est son seul rôle |
| Contrôle du ressenti | Faible : rebonds, frictions, empilements difficiles à régler | Total |
| Déterminisme / tests unitaires | Difficile (dépendance au moteur, au navigateur) | Facile : fonctions pures testables en Node |
| Coût CPU mobile | Modéré à élevé avec beaucoup de corps | Très faible (1 corps rigide) |
| Débris de crash, pièces qui volent | Pratique | Simple à imiter avec des particules / tweens |

**Recommandation : physique de vol maison** (un seul corps rigide 2D : position, vitesse, angle, vitesse angulaire), intégrée à **pas fixe** (60 Hz, accumulateur), découplée du rendu.
Les collisions avec le terrain et les obstacles se font par **tests géométriques simples** (hitbox de l'avion = quelques cercles/segments ; sol = polyligne ; obstacles = rectangles/cercles).
Matter.js n'est **pas** utilisé. Les débris et les effets comiques (roue qui roule, hélice qui s'envole) sont des **effets visuels** (particules, tweens, physique balistique triviale), sans incidence sur la simulation.

Justification : la physique est le produit. Elle doit être réglable par des paramètres lisibles, reproductible (même entrée → même vol, utile pour le débogage et l'équilibrage), et testable automatiquement.

---

## 3. Structure de l'application

### 3.1 Scènes Phaser

```
Boot ──► Preload ──► MainMenu ──► WorldMap ──► Hangar (construction + pilote)
                                     ▲              │
                                     │              ▼
                                  Results ◄──── Flight (décollage → vol → approche → contact)
                                     │
                                     └──► (déblocages / récompenses)
Scènes superposées (overlays) : HUD de vol, Pause, Réglages, Popups (récompense, pub récompensée)
```

- **Boot** : configuration, détection de l'appareil, initialisation du SDK Poki, chargement de la sauvegarde.
- **Preload** : chargement du lot d'assets « cœur » uniquement (voir §5). Signale la fin du chargement au SDK.
- **MainMenu** : écran titre minimal, bouton Jouer. Objectif : < 5 s entre ouverture et premier vol pour un nouveau joueur (le premier lancement peut même amener directement au Hangar avec un avion préassemblé).
- **WorldMap** : carte stylisée, choix de l'étape.
- **Hangar** : construction par slots, statistiques, personnalisation du pilote (onglet), validation avant décollage.
- **Flight** : simulation + rendu + caméra + événements de vol + atterrissage.
- **Results** : bilan, récompenses, phrase humoristique, illustration de la situation finale.

### 3.2 Modules (couches logiques)

```
┌─────────────────────────────────────────────────────────────┐
│ PRÉSENTATION  (Phaser : scènes, sprites, UI, audio, caméra)  │
├─────────────────────────────────────────────────────────────┤
│ GAMEPLAY      FlightController · LegDirector (événements,   │
│               zones, obstacles) · LandingJudge · Rewards     │
├─────────────────────────────────────────────────────────────┤
│ SIMULATION    AircraftModel (masse, CG, aéro agrégés)        │
│ (pur, sans    FlightPhysics (intégration pas fixe)           │
│  Phaser)      Collision (géométrie) · DamageModel            │
├─────────────────────────────────────────────────────────────┤
│ DONNÉES       Catalogue pièces · Étapes · Seuils · Économie  │
│               SaveManager (persistance, migration)           │
├─────────────────────────────────────────────────────────────┤
│ PLATEFORME    PokiAdapter (SDK) · AudioManager · Input       │
└─────────────────────────────────────────────────────────────┘
```

Règle d'or : **la couche SIMULATION n'importe jamais Phaser**. Elle est testable en Node, en ligne de commande, en dehors du navigateur.

### 3.3 Organisation prévue du dépôt (Phase 2)

```
/src
  /scenes        scènes Phaser
  /ui            composants d'interface réutilisables
  /sim           simulation pure (physique, collisions, dégâts, jugement d'atterrissage)
  /game          orchestration du gameplay (étapes, événements, récompenses)
  /data          JSON : pièces, étapes, seuils, économie, cosmétiques
  /platform      Poki, audio, input, sauvegarde
/assets          atlas, sons, musiques, polices
/tests           tests unitaires (sim, sauvegarde, économie)
/tools           scripts de build d'atlas, d'analyse de taille
/docs            documentation
```

---

## 4. Modèle de données

### 4.1 Pièce (part) — champs prévus

| Champ | Description |
|---|---|
| `id` | identifiant stable (jamais réutilisé ; la sauvegarde en dépend) |
| `category` | engine, propeller, wing, canard, tail_h, tail_v, gear, tank, accessory, special, fuselage |
| `allowedSlots` | slots compatibles (ex. une aile peut aller en `wing_front`, `wing_mid`, `wing_rear`) |
| `mass` | masse en kg « arcade » |
| `localCG` | position du centre de masse de la pièce relativement à son point d'attache |
| `liftArea` | surface portante (0 pour les pièces non portantes) |
| `liftSlope`, `stallAngle` | pente de portance et angle de décrochage (ailes, canards, empennages) |
| `dragArea` | contribution à la traînée (coefficient × surface) |
| `thrust` | poussée maximale (moteurs ; dépend de l'hélice associée) |
| `fuelUse` | consommation par seconde à plein régime |
| `fuelCapacity` | réservoirs |
| `pitchAuthority` | efficacité en tangage (gouvernes, empennages) |
| `damping` | amortissement en tangage (stabilité dynamique) |
| `durability` | points de résistance avant d'être « endommagée » |
| `gearAbsorb` | trains : vitesse verticale encaissable sans dommage |
| `gearFriction` | trains : freinage au sol / adhérence selon surface |
| `buoyant` | flotteurs : autorise l'amerrissage (seule exception à la règle de l'eau) |
| `tags` | ex. `experimental`, `vintage` (pour défis et badges) |
| `visual` | clé de sprite, points d'ancrage visuels, variantes « endommagées » |
| `unlock` | condition de déblocage (définie par l'agent économie) |

### 4.2 Fuselage et slots

Le fuselage définit une **liste de slots** : identifiant, position (x, y) relative au fuselage, catégories acceptées, obligatoire ou non. Exemple de fuselage standard : `nose`, `prop`, `wing_front`, `wing_mid`, `wing_rear`, `canard`, `tail_h`, `tail_v`, `gear_main`, `tank`, `accessory_1`, `accessory_2`. Une aile principale n'occupe **qu'une** des trois positions (`wing_*`) — c'est ce choix qui déplace le centre de portance par rapport au centre de gravité.

### 4.3 Avion assemblé (`AircraftBuild`)

Liste `slot → partId` + couleurs/décors. Le module `AircraftModel` en dérive des **grandeurs agrégées** (masse totale, CG, surface portante totale, centre de portance, traînée de base, poussée, carburant, marge statique, autorité en tangage). Ces grandeurs alimentent à la fois la physique **et** l'affichage des statistiques dans le Hangar : une seule source de vérité.

### 4.4 Étape (`Leg`)

Départ, destination, longueur arcade, profil de terrain (segments : mer, côte, campagne, ville, montagne), événements (vents, ascendances, anneaux), zones d'atterrissage (voir LANDING_AND_CRASH_SYSTEM.md), obstacles placés à la main ou par gabarits. **Les étapes sont conçues à la main avec des variantes paramétriques** (vent, positions d'anneaux), pas générées procéduralement : c'est plus juste et plus lisible (voir §8 du doc atterrissage).

---

## 5. Assets, poids et chargement

### 5.1 Ce que dit Poki (vérifié le 2026-11-13)

Sources consultées via recherche web (extraits des pages officielles, pas de lecture intégrale) :
- Page d'exigences Poki (sdk.poki.com/requirements, sdk.poki.com/new-requirements) : **viser un téléchargement initial < 8 Mo** ; retirer outils de debug et artefacts de test.
- Guide moteurs Poki (developers.poki.com/guide/web-game-engines) : un bon jeu web devrait avoir un **téléchargement initial ≤ 5 Mo** et **≤ 8 Mo au total**.
- Une présentation Poki (2019, ancienne) relie la taille à l'abandon avant de jouer (« conversion to play »).

> ⚠️ Les URL exactes citées dans le brief (developers.poki.com/guide/requirements-quality, sdk-overview) n'ont pas pu être lues intégralement depuis cet environnement ; seuls des extraits indexés ont été consultés. **À relire intégralement avant l'intégration (Phase 3).**

### 5.2 Budget cible

| Poste | Budget |
|---|---|
| Moteur + code (gzip) | ≤ 600 Ko |
| Lot « cœur » (menu, hangar, 1re étape, pilote, sons essentiels) | ≤ 3 Mo |
| **Téléchargement initial total** | **≤ 4 Mo** (marge sous les 5 Mo) |
| Lots par environnement (ville, montagne…) chargés en arrière-plan | ≤ 1 Mo chacun |
| **Total du jeu** | **≤ 8 Mo** |

### 5.3 Pipeline

- **Atlas de textures** (pièces, pilote, décors) au format WebP avec repli PNG ; 2 résolutions maximum (standard / HD), choix selon `devicePixelRatio`.
- Pilote en **sprites superposés par couches** (corps, tête, cheveux, barbe, couvre-chef, lunettes, expression, effet temporaire suie/casque de travers) : la personnalisation multiplie les combinaisons sans multiplier les images.
- Décors en **parallaxe de 3–4 couches** + tuiles réutilisables ; repères de villes en sprites uniques.
- Audio : effets en **OGG + M4A/MP3** courts, mono ; musique en streaming léger (1 boucle par ambiance, 64–96 kbps). La musique n'est pas dans le lot initial.
- Polices : 1 police d'affichage + 1 de texte, sous-ensemble de glyphes.
- Script de contrôle de taille dans la CI : le build échoue si le budget est dépassé.

---

## 6. Performance et compatibilité

- Cible : **60 fps sur un Android milieu de gamme de ~4 ans**, plancher acceptable 30 fps stable sur bas de gamme (la physique à pas fixe garantit un comportement identique quel que soit le framerate).
- Rendu WebGL avec repli Canvas automatique de Phaser.
- Nombre d'objets affichés borné ; obstacles et décors hors écran désactivés ; pools d'objets pour particules et débris.
- Pas de post-effets coûteux (flous, shaders plein écran) sur mobile ; qualité ajustée automatiquement si le framerate chute (réduction particules, parallaxe).
- Navigateurs : Chrome, Safari (iOS et macOS), Firefox, Edge, Samsung Internet. Safari iOS est le plus contraignant (audio débloqué au premier toucher, mémoire limitée).

### 6.1 Responsive et orientation

- **Paysage recommandé** (vue de profil, défilement horizontal : le paysage montre plus de distance à venir, essentiel pour anticiper l'atterrissage).
- Résolution logique de référence 16:9 (1280×720) ; mise à l'échelle « FIT » avec extension de la zone de jeu sur les ratios plus larges (on montre plus de décor, jamais de bandes noires sur l'axe horizontal).
- Mobile en portrait : écran d'invitation à tourner l'appareil. **Décision à valider** : on pourrait supporter le portrait avec une caméra plus dézoomée, mais cela double le travail d'UI. Recommandation : paysage uniquement au lancement.
- Zones tactiles et boutons ≥ 48 px physiques ; prise en compte des encoches (safe areas).

---

## 7. Sauvegarde robuste

### 7.1 Contraintes

- Pas de backend. Poki demande de sauvegarder la progression quand c'est pertinent et indique que la **navigation privée restreint localStorage** : tous les accès doivent être protégés (try/catch) pour que le jeu fonctionne malgré tout.
- Quota localStorage ~5 Mo par origine : notre sauvegarde vise **< 20 Ko**.

### 7.2 Conception

- **Format** : un objet JSON versionné `{ schemaVersion, savedAt, checksum, data }`.
- **Double emplacement** : clé principale + clé de secours (`save_main`, `save_backup`). Écriture : on écrit d'abord la sauvegarde complète dans la clé principale, on la relit et vérifie le checksum, puis on recopie dans la clé de secours. Au chargement : principale valide → OK ; sinon secours ; sinon nouvelle partie (avec message discret).
- **Moments d'écriture** : fin de vol (après calcul des récompenses), achat/déblocage, changement de réglages, modification du pilote, quitter le Hangar. Jamais en plein vol. Écritures regroupées (pas plus d'une par seconde).
- **Migration de schéma** : une fonction de migration par version (v1→v2→v3…), appliquée en chaîne au chargement. Les identifiants de pièces sont stables ; une pièce supprimée du catalogue est convertie en remboursement de monnaie.
- **Repli mémoire** : si localStorage est indisponible ou en erreur, la sauvegarde vit en mémoire pour la session et un petit bandeau indique « Progression non sauvegardée dans ce mode de navigation ».
- **Validation défensive** : valeurs bornées (monnaie ≥ 0, ids connus), champs manquants remplacés par des défauts — une sauvegarde partiellement corrompue ne doit jamais bloquer le jeu.
- **Contenu** : pièces débloquées, monnaie, étapes/destinations, records, badges, cosmétiques possédés et équipés, avion courant + quelques avions enregistrés, réglages audio, statistiques, drapeaux de tutoriel.
- **Nom de clé préfixé** par le jeu (`cyf_`) pour éviter toute collision sur un domaine partagé.

> À vérifier en Phase 3 : si Poki propose une API de sauvegarde ou des recommandations spécifiques plus récentes, elles priment.

---

## 8. Intégration du SDK Poki

### 8.1 Ce qui a été vérifié (extraits de sdk.poki.com/sdk-documentation, /html5, /phaser, /requirements — 2026-11-13)

- Appels principaux : `gameLoadingFinished`, `gameplayStart`, `gameplayStop`, `commercialBreak`, `rewardedBreak`.
- Schéma recommandé autour d'une pub : `gameplayStop` → `commercialBreak` → `gameplayStart`.
- `commercialBreak` **n'affiche pas forcément** une pub : Poki décide de la fréquence. Il faut **signaler toutes les opportunités naturelles** et **ne pas créer son propre minuteur de pubs**.
- `rewardedBreak` : prévenir le joueur avant ; le résultat indique s'il faut accorder la récompense ; ne pas récompenser si un bloqueur de pub est détecté ; il réinitialise le minuteur de pub.
- **Son coupé et entrées clavier désactivées pendant les pubs.**
- Jeux au clavier : **ÉCHAP ou Espace pour pause/reprise**, avec les événements SDK correspondants.
- Empêcher le défilement de la page parente (flèches, espace).
- Plugin Phaser officiel (github.com/poki/phaser-plugin) : appelle gameplayStart/Stop selon les scènes et coupe son/entrées pendant les pubs.

### 8.2 Correspondance avec notre boucle

| Moment | Appel SDK |
|---|---|
| Fin du Preload | `gameLoadingFinished` |
| Entrée dans Flight (décollage) | `gameplayStart` |
| Pause (ÉCHAP / bouton) | `gameplayStop` ; reprise → `gameplayStart` |
| Arrivée sur Results | `gameplayStop` |
| Passage Results → Hangar / Carte (« Rejouer ») | `commercialBreak` (opportunité), puis rien d'autre : le Hangar n'est pas du gameplay actif |
| Bouton optionnel « Doubler la récompense » / « Réparer gratuitement » | `rewardedBreak` (après avertissement) |
| **Pendant le vol** | **aucun appel publicitaire, jamais** |

Question ouverte : le Hangar compte-t-il comme « gameplay » au sens Poki ? Recommandation : `gameplayStart` au décollage seulement, à valider lors de la relecture de la doc officielle.

### 8.3 Isolation

Tout passe par un **PokiAdapter** unique : en local et en test, il est remplacé par une version factice (pubs simulées, délai, succès/échec) pour tester les flux sans le SDK. Le SDK est chargé depuis le script officiel Poki, jamais embarqué ni modifié.

---

## 9. Qualité, tests et outillage

### 9.1 Tests automatisés (Vitest, en Node)

- **Physique** : un avion de référence équilibré, plein gaz, cabrage neutre → décolle avant X m ; un avion trop lourd ne décolle pas ; un avion arrière-lourd cabre spontanément ; panne sèche → plané avec finesse dans une plage attendue. Tests de **non-régression par trajectoire** (vol scripté → position à t = 10 s dans une tolérance).
- **Atterrissage** : tableau de cas (vitesses, angle, surface, train) → catégorie attendue. C'est le test le plus important du projet.
- **Agrégation** : masse, CG, marge statique calculés pour des assemblages de référence.
- **Sauvegarde** : écriture/lecture, corruption de la clé principale, quota plein, localStorage absent, migration v1→vN.
- **Économie** : récompense = f(distance, résultat) dans les bornes définies par l'agent économie.

### 9.2 Tests manuels

- Grille d'appareils : Android bas/milieu de gamme, iPhone récent et ancien, iPad, desktop Chrome/Safari/Firefox.
- Vérification avec l'outil d'inspection de Poki (Poki Inspector) en Phase 5.

### 9.3 GitHub Actions (à partir de la Phase 2)

1. Sur chaque PR : lint + vérification de types + tests unitaires.
2. Build de production + **contrôle du budget de taille** (échec si dépassé).
3. Optionnel : déploiement automatique d'une préversion jouable (GitHub Pages, accessible seulement si le dépôt le permet) pour tester sur téléphone.

### 9.4 Outils de réglage

Un **panneau de debug** (désactivé et retiré du build de production, conformément aux exigences Poki) : modifier en direct les paramètres physiques, afficher vecteurs de forces, CG et centre de portance, rejouer un vol. Indispensable pour l'équilibrage, coût modéré.

---

## 10. Risques techniques

| Risque | Impact | Parade |
|---|---|---|
| Physique « juste » mais pas amusante | Critique | Prototype de vol en tout premier ; paramètres en données ; assistance au pilotage ; itérations courtes |
| Contrôles tactiles imprécis | Élevé | Schéma simple (§ contrôles), tests sur vrais téléphones dès la semaine 1 |
| Explosion combinatoire de pièces → avions cassés ou dominants | Élevé | Agrégation testée ; outil d'analyse qui calcule les stats de tous les assemblages possibles et signale les extrêmes |
| Poids des assets (pilote personnalisable, environnements) | Moyen | Couches de sprites, lots chargés à la demande, contrôle CI |
| Audio iOS | Moyen | Déblocage au premier toucher, test précoce |
| Règles Poki évolutives | Moyen | Relecture de la doc officielle à chaque phase ; adaptateur isolé |
| Dette de prototype | Moyen | Couche simulation propre dès le départ ; le reste peut être jetable |
