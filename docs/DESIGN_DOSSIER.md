# Dossier de conception — CAN YOU FLY? (Phase 1)

> **Statut : EN ATTENTE DE VALIDATION** par le porteur du projet. Aucun code n'a été écrit.
> Ce document est la **synthèse** du chef de projet. Le détail de chaque domaine est dans les documents référencés.
> Date : 13/11/2026.

---

## 0. En une phrase

**Construis un avion bricolé, pilote-le d'une ville à l'autre à travers l'Europe… puis réussis à le poser.**
Accroche proposée : *« Build it. Fly it. Now land it. »*

Ce qui nous différencie sur Poki (analyse concurrentielle → `MARKETING_STRATEGY.md`) : les jeux existants font **soit** de la construction (Build League), **soit** du lancer-distance avec upgrades (Learn 2 Fly), **soit** de l'atterrissage (Perfect Landing, Plane Pilot). **Aucun ne combine construction avec compromis + atterrissage noté + voyage.** C'est notre angle, et c'est l'atterrissage qui doit porter l'identité.

---

## 1. Avis franc sur le cahier des charges

**Ce qui est très bon**
- La boucle BUILD → FLY → LAND OR CRASH est courte, lisible et naturellement rejouable.
- L'atterrissage comme mécanique centrale : c'est le vrai différenciateur. Bonne intuition de l'exiger dès le prototype.
- « Un échec rapporte toujours » + pas de frustration pour vendre des pubs : exactement ce que Poki valorise (temps de jeu).
- Un seul pilote richement personnalisable plutôt que plusieurs pilotes pauvres : bon choix de production.

**Ce que je conteste**

| Point du brief | Problème | Recommandation |
|---|---|---|
| Paris → **Londres** en étape 1 | La Manche dès le 1er vrai vol : la majorité des échecs seraient des WATER CRASH, l'échec le moins instructif. Mauvaise première impression. | Réordonner : première mer à l'étape 4 (voir §8). |
| « Améliorations » (upgrades) | Contredit directement « aucune pièce strictement meilleure ». Les upgrades transforment le jeu en *Learn to Fly* (grind de puissance). | **Pas d'upgrades de stats.** La progression = de nouvelles pièces *différentes*, des destinations et des cosmétiques. |
| Construction « suffisamment libre » | Une construction libre (pièces n'importe où) multiplie les cas impossibles à équilibrer et à rendre jouables au tactile. | **Construction à emplacements (slots)** avec quelques positions réglables (l'aile avant/milieu/arrière). Assez de liberté pour expérimenter, zéro avion « cassé ». |
| 10–12 types de pièces **dès le prototype** | Faisable en données, coûteux en graphismes et en équilibrage. | 12 catégories mais **~24 pièces** au prototype (placeholders), ~36–45 au MVP. |
| Toits, plateformes, flotteurs, zones de secours sur l'eau | Spectaculaire mais cher (cas physiques spéciaux, level design). | Toits/plateformes : 1–2 au MVP max. Flotteurs : **après le MVP** (à décider, §12). |
| Prototype très riche (liste du §16) | C'est presque un MVP. Risque : 2 mois avant de savoir si c'est fun. | Garder la liste, mais **jalon intermédiaire « sensation de vol »** au bout de ~2 semaines (vol + atterrissage sur une piste avec avion fixe), validé par vous avant de construire le hangar complet. |
| Nom « CAN YOU FLY? » | Ne parle pas d'atterrissage, proche de *Learn to Fly* / *How Far Can You Fly?*, marque US « YOU CAN FLY » existante. | Garder comme **nom de code**, décider du nom final avant la Phase 5 (pistes : « Build. Fly. Land! », « Crash Landing Club »). |

---

## 2. Concept final recommandé et piliers

1. **Bricoler, c'est expérimenter** — chaque pièce a un avantage ET un défaut ; on construit pour une étape, pas « le meilleur avion ».
2. **Piloter, pas regarder** — le joueur agit toutes les secondes du vol.
3. **L'atterrissage est le boss de fin** — tension jusqu'à la dernière seconde, choix tactique de la zone.
4. **Échouer est drôle et utile** — crash comique, cause compréhensible, récompense conservée, relance en 1 tap.
5. **Un voyage, pas des niveaux** — une carte d'Europe stylisée, des souvenirs de chaque ville.

Ce que le jeu n'est **pas** : un simulateur, un jeu de grind, un jeu d'aventure 3D.

---

## 3. Boucle de gameplay détaillée

```
HANGAR (30–90 s) → DÉCOLLAGE (5–10 s) → CROISIÈRE (40–90 s) → APPROCHE (15–30 s)
   → ATTERRISSAGE / CRASH (3–5 s, ralenti) → RÉSULTATS (8–12 s, skippable)
   → RÉCOMPENSE + DÉBLOCAGES → CARTE → HANGAR
```

**Les 60 premières secondes** (critique pour Poki, où les joueurs partent vite) :
- 0 s : le jeu s'ouvre directement sur un avion déjà construit (« Le Coucou ») sur la piste de Paris. **Pas de hangar au premier lancement.**
- < 20 s : le joueur a décollé (une seule consigne animée : « Maintiens ↑ / pouce vers le haut »).
- ~45 s : approche d'un grand champ + une piste. Impossible de finir dans l'eau sur ce vol tutoriel.
- ~60 s : premier atterrissage, premiers Boulons, **premier déblocage** → ouverture du hangar.

Détail : `GAME_DESIGN.md` §2.

---

## 4. Construction de l'avion

- **Un fuselage + 10 emplacements** : moteur, hélice, aile principale (3 positions), petite aile/canard, stabilisateur, dérive/gouverne, train, réservoir, 1–2 accessoires (selon le fuselage).
- **12 catégories** : fuselages, moteurs, hélices, ailes, petites ailes, stabilisateurs, gouvernes, trains, réservoirs, accessoires aéro, spéciaux (1 usage/vol : fusée, airbag…), expérimentaux (ressorts, ballon…).
- **Interaction** : tap sur une pièce = installation directe (indispensable sur mobile) ; glisser-déposer avec aimantation en bonus.
- **Lisibilité de l'équilibre** : l'avion **penche sur son support** selon son centre de gravité (ressort cartoon), marqueurs CG / centre de portance, 5 barres de stats (Vitesse, Montée, Stabilité, Maniabilité, Autonomie) + Solidité, avec **delta vert/rouge** avant de poser une pièce. Pas de chiffres bruts (option « Détails »).
- **Validation** : on peut décoller avec un avion absurde (c'est drôle), mais le pilote prévient une fois (« Euh… pas de train. Sûr ? »).
- **Trade-offs** : règle de conception vérifiée automatiquement plus tard — *aucune pièce n'est meilleure qu'une autre de sa catégorie sur toutes les stats*.

Détail et catalogue chiffré : `GAME_DESIGN.md` §3–4.

---

## 5. Modèle physique proposé

- **Physique de vol maison** (pas Matter.js) : un seul corps rigide en 2D (position, vitesse, angle, vitesse angulaire), pas de temps fixe à 60 Hz, indépendant du rendu → testable automatiquement et identique sur tous les appareils.
- **Forces** : poussée (moteur, baisse avec le carburant vide → vol plané), portance ∝ v² × surface × f(angle d'attaque) avec **décrochage simplifié**, traînée, gravité.
- **Masse et centre de gravité** calculés à partir des pièces ; **marge statique** (écart CG / centre de portance) → un avion lourd de l'arrière cabre tout seul, un avion lourd de l'avant pique. Un trim automatique compense *en partie* : un mauvais avion vole, mais avec un défaut **ressenti**.
- **Dégâts en vol** : une aile abîmée réduit la portance d'un côté → l'avion tire ; une hélice cassée réduit la poussée. Temporaire (vol en cours uniquement).
- Les débris de crash sont des **effets visuels**, pas de la physique.

Détail et formules : `PHYSICS_AND_CONTROLS.md`.

---

## 6. Pilotage

| | Desktop | Mobile / tablette |
|---|---|---|
| Tangage (cabrer / piquer) | ↑ ↓ (ou W/S) | Manche **relatif** sous le pouce droit (glisser haut/bas) |
| Gaz | ← → (ou A/D) | Curseur sous le pouce gauche |
| Spécial (fusée, airbag…) | Espace | Bouton dédié |
| Pause | Échap (exigence Poki) | Bouton pause |

- **Aides** : gaz automatiques au début du jeu (le joueur ne gère que le tangage), stabilisation douce, **ligne de trajectoire prédite** pendant l'approche.
- **Paysage uniquement** sur mobile (vue de profil = besoin de largeur).
- Courbe d'apprentissage : étape 1 = tangage seul ; les gaz manuels deviennent utiles à partir de l'étape 2–3.

---

## 7. Atterrissage et crash

- **Indice de sévérité** au contact = combinaison de la vitesse verticale, de l'assiette (angle) et de la vitesse horizontale, **divisée par la tolérance** de la surface et du train (un train à ressorts encaisse plus).
- Seuils initiaux (à équilibrer) : **PERFECT ≤ 0,5 · GOOD ≤ 1,0 · ROUGH ≤ 1,6 · au-delà CRASH LANDING**. On juge le contact **et** le roulage ; la pire note l'emporte (heurter un lampadaire en roulant = dégradation).
- **Eau = WATER CRASH**, toujours, sauf zone de secours explicitement balisée (bouée, ponton) — *et* éventuels flotteurs post-MVP.
- **Équité** (règles non négociables) : obstacles visibles **≥ 3 s** avant, rien n'apparaît au dernier moment, aucun nouvel événement négatif dans les 8 dernières secondes, caméra qui **dézoome** à l'approche, étapes **construites à la main** (pas de génération aléatoire des obstacles).
- **Choix tactique** : autour de chaque destination, 2–4 zones (ex. piste étroite en ville = bonus fort / grand champ avant la ville = sûr / parc entre les arbres = intermédiaire).
- **Dégâts visibles** par pièce (aile pliée, hélice tordue, roue arrachée), **jamais** de perte définitive. **Réparation toujours gratuite.**
- **Pilote** : état final (pleine forme → décoiffé → secoué → sonné → noirci → casque de travers → abasourdi), **superposé** à ses cosmétiques.

Détail : `LANDING_AND_CRASH_SYSTEM.md`.

### Arbitrage : quand une étape est-elle « réussie » ?
Les agents divergeaient (Design : tout atterrissage dans la zone d'arrivée valide, même un crash ; Dev : un champ hors zone ne valide pas). **Ma synthèse — à valider (§12, D5)** :
- **Étape validée** = l'avion s'arrête **dans la zone d'arrivée** (toutes les zones autour de la destination, y compris le champ « sûr »), **hors eau**, quelle que soit la qualité.
- La qualité donne des **étoiles** (CRASH = 1 ★, ROUGH/GOOD = 2 ★, PERFECT = 3 ★) et plus de Boulons. Les étoiles alimentent défis et badges → **rejouabilité** sans bloquer la progression.
- Atterrir **avant** la zone d'arrivée = Boulons selon la distance, étape non validée, message narratif (« Tu voulais rejoindre Londres. Tu as trouvé un champ. »).

---

## 8. Progression géographique

**Proposition (Design), que je soutiens** — la mer arrive quand le joueur sait piloter :

| # | Étape | Nouveauté introduite |
|---|---|---|
| 0 | Paris → Reims | **Tutoriel** : tangage, piste, champ, rivière (1er WATER CRASH possible mais évitable) |
| 1 | Reims → Bruxelles | Gaz manuels, vent de face, ville + parc |
| 2 | Bruxelles → Amsterdam | Canaux (eau omniprésente mais étroite), rafales |
| 3 | Amsterdam → Londres | **Première traversée de mer** (Mer du Nord) — gestion du carburant |
| 4 | Londres → Berlin | Longue étape, réservoir, ascendants |
| 5 | Berlin → Rome | **Les Alpes** : relief, plateaux, pistes difficiles |
| 6 | Rome → Athènes | Littoral, îles, plages |
| 7 | Athènes → Istanbul | Finale : détroit, ville dense, toits |

8 étapes, 9 villes. Le brief en comptait 6 (7 villes). **Coût** : ~2 étapes de plus à construire (≈ 3–4 jours) mais une bien meilleure courbe de difficulté. L'étape 0 est courte et réutilise les décors de campagne.

Narration : les résultats racontent le trajet (« Départ de Reims. Destination Bruxelles. Atterrissage dans un parc à 2 km de la Grand-Place. »). Carte d'Europe stylisée qui se colore au fur et à mesure.

Détail : `WORLD_MAP.md`.

---

## 9. Récompenses et économie

- **Une seule monnaie : les Boulons 🔩.**
- **Gain d'un vol** = 60 % lié à la **distance** (acquis même après un crash) + jusqu'à 40 % selon l'**atterrissage** × multiplicateur de zone + anneaux + défis + bonus de 1re arrivée. **Plancher : 10 Boulons.**
- **Pièces** : chaque ville débloquée ouvre un **catalogue** ; on y achète des pièces en Boulons. Les pièces expérimentales se gagnent par **badges et défis**.
- **Pas d'upgrades de stats** (voir §1).
- **3 défis par étape** (façon « 3 étoiles ») + **18 badges** bronze/argent/or, dont des badges d'échec humoristiques (*Plongeur*, *Casse-cou*, *Têtu*).
- **Cosmétiques** : ~50 au MVP (souvenirs de ville, badges, boutique en Boulons).
- **Durée visée** : **1 h 30 – 2 h 30** pour finir le MVP **sans regarder une seule pub** — c'est un critère d'acceptation de l'équilibrage.
- **Anti-frustration** : aides visibles et gratuites après 1, 2, 3, 5, 8 échecs sur une étape (conseil du pilote → suggestion de pièce → preset recommandé), jamais de baisse de difficulté cachée.

Détail : `PROGRESSION_SYSTEM.md`, `DIFFICULTY_BALANCING.md`.

---

## 10. Monétisation Poki

- **Uniquement le SDK Poki**. Pas d'achats intégrés, pas de pub tierce, pas de « retirer les pubs ».
- **Interstitiel** (`commercialBreak`) : uniquement quand le joueur **clique sur « Revoler » / « Continuer »** après les résultats. Jamais pendant le vol, jamais à l'ouverture d'un menu. Pas au 1er vol de la session ni après un vol < 15 s. La fréquence réelle est gérée par Poki (pas de minuteur maison — c'est interdit).
- **Récompensées** (`rewardedBreak`) — toujours facultatives, bouton sur le côté :
  - ✅ « Doubler les Boulons de ce vol » (écran de résultats) ;
  - ✅ « Essayer cette pièce pour un vol » (hangar) ;
  - ❌ seconde chance en vol, réparation payante, déblocage de destination : **rejetés** (frustration artificielle).
- Son et clavier coupés pendant les pubs.

Détail : `MONETIZATION_STRATEGY.md`, `POKI_COMPLIANCE.md`.

---

## 11. Direction artistique et son

**Deux pistes étudiées :**
- **A — « Atelier du Dimanche »** *(recommandée)* : avions bricolés à partir d'objets du quotidien, ambiance affiche de voyage rétro des années 50–60, contours épais, couleurs chaudes et franches. Identité forte, cohérente avec « bricoler » et « voyager », peu vue sur Poki.
- **B — « Jouet Pop »** : plastique brillant, formes arrondies, couleurs saturées. Plus sûr, mais très répandu → générique.

**Pilote** : nom proposé **« Pip »**, genre non marqué par défaut, grosse tête expressive (lisible à 100 px pour la miniature), 15 calques de rendu (cosmétiques + effets temporaires superposés), animation par découpe (pas de Spine).

**Son** : pas de musique continue en vol (moteur + vent, puis **tension** à l'approche), musique légère au hangar et sur la carte, bruitages cartoon (boing, couinements, crash comique), pilote qui parle en **charabia**. Volume + mute, mute automatique pendant les pubs.

**Production réaliste** : formes simples / packs libres (Kenney) pour le prototype → **un illustrateur freelance pour le MVP**. L'IA générative seulement pour le concept art (elle produit mal des pièces cohérentes et assemblables).

Détail : `ART_DIRECTION.md`, `PILOT_CHARACTER.md`, `CUSTOMIZATION_SYSTEM.md`, `AUDIO_DESIGN.md`.

---

## 12. Architecture technique recommandée

| Sujet | Choix | Pourquoi |
|---|---|---|
| Moteur | **Phaser 3 + TypeScript + Vite** | Léger, mature, plugin Poki officiel, excellent sur mobile. Godot/Unity web : trop lourds, démarrage lent. |
| Physique | **Maison**, pas de Matter.js | Un seul corps à simuler ; contrôle total du « feeling » ; testable. |
| Données | Pièces, étapes, seuils, économie dans des **fichiers JSON** éditables | Équilibrage sans toucher au code. |
| Sauvegarde | JSON versionné + checksum, emplacement principal + secours, migrations, **repli en mémoire** en navigation privée | Ne jamais perdre la progression. |
| Poids | Chargement initial **≤ 4 Mo** (Poki exige < 8 Mo), jeu complet ≤ 8 Mo, **contrôlé automatiquement** en CI | Les joueurs partent au-delà de ~10 s de chargement. |
| Tests | Tests unitaires physique, seuils d'atterrissage, économie, sauvegarde ; tests manuels desktop + mobile | Rien n'est « terminé » sans test. |
| Hébergement de test | **GitHub Pages** (repo public, décision du porteur) | Tester sur son téléphone sans rien installer. |
| Textes | Fichier unique par langue (FR + EN au lancement) | Poki est mondial. |

Détail : `TECHNICAL_ARCHITECTURE.md`.

---

## 13. Organisation GitHub retenue

- `main` stable + branches `feature/*`, `fix/*`, `release/*` ; **pas de `develop`** (inutile à cette taille).
- Conventional Commits, PR avec check-list desktop/mobile/secrets.
- Labels : domaine (`agent:*`), priorité (`P0/P1/P2`), type, phase, statut.
- Milestones M1 → M5 (voir `ROADMAP.md`).
- Détail : `PROJECT_WORKFLOW.md`.

---

## 14. Fonctionnalités du prototype (Phase 2)

**Indispensable (P0)** — tout ce que le brief exige, en version simple :
hangar à slots (12 catégories, ~24 pièces placeholders) · stats et équilibre visibles · pilote visible + 3–4 cosmétiques · physique de vol · pilotage clavier + tactile · décollage / vol / panne sèche / vol plané · **1 étape tutoriel + 1 vraie étape** (Paris→Reims, Reims→Bruxelles) · approche avec ligne de trajectoire · 3–4 zones d'atterrissage + obstacles · 5 résultats dont WATER CRASH · dégâts visibles · états du pilote · écran de résultats (version simple) · 10–15 bruitages · sauvegarde minimale · build en ligne sur GitHub Pages.

**Hors prototype (MVP ou après)** : carte complète, économie complète, badges, 50 cosmétiques, SDK Poki, musique définitive, graphismes définitifs, flotteurs, presets d'avion, défi quotidien, partage d'image.

**Jalon intermédiaire « Sensation de vol » (~2 semaines)** : un avion fixe, une piste, du vent, l'atterrissage noté. Vous jouez sur votre téléphone et on décide si le pilotage est agréable **avant** de construire le reste.

---

## 15. Risques principaux

| # | Risque | Prob. | Impact | Parade |
|---|---|---|---|---|
| R1 | **La physique est juste mais pas amusante** | Moyenne | Critique | Jalon « Sensation de vol » d'abord ; tuning par fichiers ; tests sur téléphone réel |
| R2 | Contrôles tactiles imprécis (≈ la moitié du trafic) | Moyenne | Fort | Manche relatif, aides, tests mobiles dès le 1er build |
| R3 | Atterrissage perçu comme injuste | Moyenne | Fort | Règles d'équité, ligne de trajectoire, phrases qui expliquent la cause |
| R4 | **Production graphique** (avions, pilote, 8 décors) | Haute | Fort | Placeholders au prototype ; budget freelance (décision D9) ; style A peu coûteux en détails |
| R5 | Équilibrage des pièces (36–45 pièces × 8 étapes) | Haute | Moyen | Données en JSON, contrôle automatique des trade-offs, télémétrie locale de test |
| R6 | **Accès à Poki for Developers** (bêta fermée, non garanti) | Moyenne | Critique pour la publication | Candidater tôt (dès le prototype jouable) ; plan B : autres portails (CrazyGames…) |
| R7 | Concurrence dans la catégorie « avions » sur Poki | Moyenne | Moyen | Miser sur l'atterrissage + les crashs drôles dans la miniature |
| R8 | Règles Poki mal connues | Faible | Moyen | Nos agents n'ont pu lire que des **extraits** (sites Poki bloqués par le réseau de l'environnement). Relecture complète par un humain avant la Phase 3 (issue dédiée) |
| R9 | Dérive de périmètre (le brief est riche) | Haute | Fort | Liste P0/P1/P2 stricte, chaque ajout passe par `DECISIONS.md` |
| R10 | Repo public → concept visible | Faible | Faible | Assumé (décision D0) ; aucun secret dans le dépôt |

---

## 16. Estimation et planning prévisionnel

Unités : **jours-homme de développement assisté par IA**, hors production graphique définitive et hors temps de vos playtests.

| Phase | Contenu | Effort | Durée calendaire indicative* |
|---|---|---|---|
| 1 — Conception | Ce dossier | fait | — |
| 2a — Sensation de vol | Physique, contrôles, 1 piste, atterrissage | 6–8 j | 2 semaines |
| 2b — Prototype complet | Hangar, pièces, 2 étapes, résultats, pilote, sons | 15–22 j | 3–4 semaines |
| 3 — MVP | 8 étapes, carte, économie, badges, cosmétiques, sauvegarde, SDK Poki, FR/EN | 25–35 j | 6–8 semaines |
| 4 — Polish | Animations, VFX, son, équilibrage, perf | 10–15 j | 3–4 semaines |
| 5 — Publication | Build, Poki Inspector, miniature, textes | 4–6 j | 1–2 semaines + délai Poki |
| **Total** | | **≈ 60–85 j** | **≈ 4 à 5 mois** |

\* Dépend surtout de votre disponibilité pour tester et valider, et du délai de l'illustrateur.

**Complexité globale** : moyenne-haute pour un jeu Poki. Le code n'est pas le goulet d'étranglement ; **le feeling du vol, l'équilibrage et les graphismes le sont.**

---

## 17. Décisions qui nécessitent votre accord

| # | Décision | Ma recommandation |
|---|---|---|
| D1 | Construction à emplacements (slots), pas libre | ✅ Oui |
| D2 | Premier vol sans construction, avion par défaut « Le Coucou » | ✅ Oui |
| D3 | Contrôles : tangage + gaz manuels (gaz auto au début), paysage uniquement sur mobile | ✅ Oui |
| D4 | **Pas d'upgrades de stats** (progression = nouvelles pièces différentes) | ✅ Oui |
| D5 | Étape validée = arrêt dans la zone d'arrivée hors eau, quelle que soit la qualité ; qualité = étoiles + Boulons | ✅ Oui |
| D6 | Nouvel ordre des villes (8 étapes, première mer à l'étape 3) | ✅ Oui |
| D7 | Flotteurs / amerrissage : **après le MVP** ; zones de secours balisées seulement | ✅ Après MVP |
| D8 | Direction artistique **A « Atelier du Dimanche »** ; pilote « Pip », genre non marqué | ✅ A + Pip |
| D9 | Budget graphismes freelance (estim. 1 500–4 000 €) et musique (300–1 000 €) — ou tout faire avec packs libres + IA (qualité moindre) | ❓ À vous de dire |
| D10 | Monnaie « Boulons », pubs : interstitiel au clic « Revoler », 2 rewarded (×2 gains, essai de pièce) | ✅ Oui |
| D11 | Durée cible du MVP : 1 h 30 – 2 h 30 sans pub | ✅ Oui |
| D12 | Cible principale 8–16 ans + famille, mobile en priorité ; FR + EN au lancement | ✅ Oui |
| D13 | Nom : « CAN YOU FLY? » reste nom de code, nom final décidé en Phase 4 | ✅ Oui |
| D14 | Jalon « Sensation de vol » avant le prototype complet | ✅ Oui |
| D15 | Candidater à Poki for Developers dès le prototype jouable (et accepter l'exclusivité web Poki) | ✅ Oui |
