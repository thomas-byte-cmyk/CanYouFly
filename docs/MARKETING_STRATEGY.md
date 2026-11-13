# MARKETING_STRATEGY — CAN YOU FLY? (titre provisoire)

> **Auteur :** Agent 3 — Marketing & Product Growth · **Phase :** 1 (conception) · **Date :** 2026-11-13
> **Statut :** proposition, à valider par le porteur du projet.

## 0. Méthode et fiabilité des sources

- Recherches web effectuées le **2026-11-13**.
- **Limite importante :** depuis l'environnement de travail, l'accès direct à `poki.com`, `developers.poki.com` et `sdk.poki.com` est **bloqué par le proxy réseau** (HTTP 403). Les informations « Poki » ci-dessous proviennent des **extraits indexés par le moteur de recherche** de ces pages officielles, pas d'une lecture intégrale. Elles doivent être **relues directement** avant l'intégration (voir issue de suivi dans `POKI_COMPLIANCE.md`).
- Légende utilisée dans ce document :
  - ✅ **Vérifié** — confirmé par l'extrait d'une page officielle Poki ou par plusieurs sources concordantes.
  - 🟡 **Source secondaire** — article tiers, chiffre plausible mais non confirmé par Poki.
  - 🔵 **Estimation / hypothèse** — raisonnement de l'agent, non sourcé.

---

## 1. Marché : le jeu web et Poki

| Donnée | Valeur | Fiabilité | Source |
|---|---|---|---|
| Joueurs mensuels Poki (2026) | > 100 millions | ✅ | [Poki — 2026 State of Web Gaming](https://poki.com/blog/state-of-web-gaming-report-2026) |
| Joueurs sur l'année 2025 | 625 millions, 11,1 milliards de parties | ✅ | [Poki — 2025 Year in Review](https://poki.com/blog/2025-at-poki-a-year-in-review) |
| Part mobile | « près de la moitié » des joueurs sur Android/iOS | 🟡 (rapport Poki cité par Defold) | [Defold — Good practices for web games on Poki](https://defold.com/2026/11/03/Good-practices-for-web-games-on-Poki/) |
| Jeu web joué mensuellement | 46 % des consommateurs en ligne 13–55 ans | 🟡 | [Super League white paper (StockTitan)](https://www.stocktitan.net/news/SLE/new-super-league-white-paper-sizes-up-the-web-s-most-overlooked-ad-foyzxlbip2g8.html) |
| Temps de jeu moyen d'un jeu Poki | ~6+ min, conversion-to-play ~70 % | ✅ (extrait doc Poki) | [Interpreting your test results](https://developers.poki.com/guide/reading-results) |
| Tolérance au chargement | les joueurs partent si le chargement dépasse ~10 s | ✅ (extrait doc Poki) | [Requirements](https://developers.poki.com/guide/requirements-quality) |
| Revenus typiques d'un jeu « qui marche bien » | ~200–2 000 $/mois | 🟡 (très variable) | [Cinevva — Web game monetization](https://app.cinevva.com/guides/web-game-monetization) |

**Âge de l'audience :** aucune répartition officielle trouvée. 🔵 Hypothèse de travail : cœur d'audience **8–16 ans** (usage scolaire / pauses) + adultes casual sur mobile. Conséquence : contenu familial, lecture minimale, compréhension sans texte.

**Ce que ça implique pour nous**
1. **Moitié mobile** → les contrôles tactiles ne sont pas un portage, c'est une cible principale (aligné avec la règle « forcer les contrôles mobiles sur tablette »).
2. **Sessions courtes, zéro friction** → le premier vol doit démarrer en **< 20 s** après le clic sur la miniature (avion pré-construit, voir §6).
3. **Le marché récompense le temps de jeu** : la métrique qui fait (ou défait) un jeu sur Poki est le **playtime moyen** puis la **conversion**. Notre boucle construire → voler → atterrir doit maximiser les « encore un vol ».

---

## 2. Analyse concurrentielle (présence vérifiée)

| Jeu | Présence | Ce qu'il fait bien | Faiblesses / opportunité pour nous |
|---|---|---|---|
| **Learn 2 Fly** (HeroCraft) — lancer un pingouin, améliorer rampe/fusées | ✅ sur Poki ([webcatalog — fiche Poki](https://webcatalog.io/en/apps/poki-learn-2-fly)) ; série issue du Flash *Learn to Fly* (2009) | Boucle « lancer → gagner → améliorer » ultra-addictive ; progression visible ; chaque essai rapporte | Pilotage quasi passif ; pas de vraie fin de vol ; amélioration = toujours « plus » (pas de compromis) |
| **Build League** — construire avions/voitures en blocs, voler dans des parcours | ✅ [poki.com/en/g/build-league](https://poki.com/en/g/build-league) | Construction libre, gestion du carburant, upgrades achetés | **Concurrent le plus direct sur la construction.** 3D par blocs → notre différence : 2D cartoon lisible, atterrissage noté, voyage entre villes |
| **Perfect Landing, Plane Pilot** (GeniGames) — piloter et atterrir sur des îles, éoliennes | ✅ [poki.com/en/g/perfect-landing-plane-pilot](https://poki.com/en/g/perfect-landing-plane-pilot) | Prouve qu'il existe une audience **pour l'atterrissage** sur Poki | Pas de construction d'avion ; l'avion est imposé |
| **Silly Sky** — contrôle aérien, faire atterrir des avions | ✅ [poki.com/en/g/silly-sky](https://poki.com/en/g/silly-sky) | Ton humoristique, univers coloré | Gestion, pas pilotage |
| **Drive Mad** (Fancade) — voiture physique, équilibre, atterrissages après sauts | ✅ [poki.com/en/g/drive-mad](https://poki.com/en/g/drive-mad) — « joué plus de 300 M de fois » | Physique simple mais expressive ; échecs drôles et instantanés ; relance immédiate ; niveaux courts | Pas de méta-progression ; référence pour **le feeling des crashs et la vitesse de relance** |
| Catégorie **Airplane Games** de Poki (Pilot Life, Sky Mad, Airplane Manager, Plane Wars…) | ✅ [poki.com/en/airplane](https://poki.com/en/airplane) | La catégorie existe et est fournie → audience établie | Catégorie **concurrentielle** : il faudra une miniature très distinctive |
| Hors Poki : *Aviassembly* (Steam), *SimplePlanes*, *Build A Plane* (Roblox), *Make It Fly!* (mobile) | 🟡 | Valident l'attrait « construire son avion » | Trop complexes (Aviassembly, SimplePlanes) pour un public web casual |

### Leçons
1. **Le marché valide nos deux piliers séparément** (construction : Build League ; atterrissage : Perfect Landing). **Aucun jeu trouvé ne combine construction à compromis + atterrissage noté + voyage géographique.** C'est notre angle.
2. **Learn 2 Fly** montre la force du « chaque essai rapporte » → à reprendre (récompense proportionnelle à la distance), en évitant son défaut : la progression purement « plus fort ».
3. **Drive Mad** montre que la **vitesse de relance** compte autant que le contenu : bouton « Revoler » en un tap depuis l'écran de résultats.
4. **Risque de ressemblance** : avec *Learn to Fly* (nom proche, concept « apprendre à voler ») et *Build League* (construction d'avion). On reste dans le genre, sans reprendre personnage, nom, visuels ou structure spécifiques. Pas de pingouin, pas de rampe de glace.

---

## 3. Public cible et personas

| Persona | Profil | Ce qu'il veut | Ce qui le fait partir |
|---|---|---|---|
| **Léo, 11 ans** (cœur de cible) | Joue sur Chromebook à l'école ou sur la tablette familiale, sessions 5–15 min | Rire des crashs, débloquer des trucs, montrer son pilote à ses amis | Texte à lire, tutoriel long, échec incompréhensible |
| **Inès, 15 ans** | Mobile, joue en attendant | Défis, records, « je l'ai eu en PERFECT » | Contrôles tactiles imprécis, publicité trop fréquente |
| **Marc, 34 ans** (casual adulte) | Desktop au bureau, pauses courtes | Un petit défi de maîtrise, de la satisfaction rapide | Lenteur de progression, infantilisation |
| **Le bricoleur** (transversal) | Tous âges | Tester des avions absurdes et voir s'ils volent | Builder rigide où il n'y a qu'une « bonne » réponse |

**Cible primaire : 8–16 ans, mobile + desktop.** Cible secondaire : casual adultes. Le ton doit faire rire les enfants **sans** paraître bébé aux ados (cf. direction artistique).

---

## 4. Positionnement et proposition de valeur

**Phrase de positionnement (interne) :**
> Pour les joueurs casual qui aiment bricoler et rire de leurs échecs, *CAN YOU FLY?* est le jeu d'avion où **tu construis ton propre engin, tu le pilotes vraiment et tu dois réussir à le poser** — de Paris à Istanbul. Contrairement aux jeux de lancer où l'on regarde son personnage voler, ici chaque vol se joue jusqu'à la dernière seconde : l'atterrissage.

**Accroches (à tester) :**
- EN : *"Build it. Fly it. Now land it."* ← recommandée
- EN : *"Anyone can take off. Can you land?"*
- FR : *« Construis-le. Pilote-le. Et maintenant… pose-le. »*

**Trois piliers différenciants, dans l'ordre de communication :**
1. **L'atterrissage noté** (PERFECT → WATER CRASH) — tension de fin de vol, moment le plus « clipable ».
2. **Les avions bricolés avec des compromis** — chaque pièce a un avantage ET un défaut ; les avions absurdes peuvent marcher.
3. **Le voyage** — Paris → Londres → … → Istanbul : une progression qui raconte une histoire (« Tu voulais Londres, tu as trouvé un champ »).
4. *(transversal)* **Le pilote** — mascotte expressive et personnalisable : c'est elle qui porte la miniature et l'attachement.

---

## 5. Nom du jeu

### Critique de « CAN YOU FLY? »
- ✅ Pas d'homonyme exact trouvé (App Store, Poki, Roblox, itch.io) lors de la recherche.
- ⚠️ **Faiblesses :**
  - **Ne dit rien de l'atterrissage ni de la construction**, nos deux vrais différenciants.
  - Formulation proche de *Learn to Fly* (série connue du même genre) et de *How Far Can You Fly?* (Roblox) → faible mémorabilité, risque de confusion dans la recherche.
  - Le point d'interrogation pose problème dans les URL/slug (`can-you-fly`) — mineur.
  - Une marque américaine « YOU CAN FLY » existe en classe 041 (divertissement/éducation) selon [Justia](https://trademark.justia.com/865/39/you-can-86539680.html) — 🔵 risque juridique jugé faible (formulation différente, propriétaire non lié au jeu vidéo), **mais à faire vérifier** avant publication (EUIPO + USPTO, classes 009 et 041). Je ne suis pas juriste.
- **Verdict :** utilisable comme nom de code, **pas le meilleur nom de publication**.

### Alternatives proposées (à vérifier en recherche d'antériorité avant décision)
| Nom | Pourquoi | Risque |
|---|---|---|
| **Build. Fly. Land!** | Dit exactement la boucle, compréhensible dans toutes les langues | Peu « marque » |
| **Crash Landing Club** | Drôle, met en avant l'atterrissage et l'humour | « Crash Landing » est un terme courant (série TV *Crash Landing on You*) → vérifier |
| **Hangar Heroes** | Évoque la construction + la mascotte | Moins explicite sur le vol |
| **Sky Tinkerer** | Bricolage + ciel | Mot « tinkerer » difficile pour les non-anglophones |
| **Land It!** | Court, impératif, mémorable, centré sur notre différenciant | Très générique, recherche difficile |

**Recommandation : garder « CAN YOU FLY? » en nom de code et tester 2 noms (« CAN YOU FLY? » vs « Build. Fly. Land! » ou « Crash Landing Club ») lors des tests joueurs.** Sur Poki, la miniature pèse beaucoup plus que le nom (voir §6) : la décision n'est pas bloquante pour la phase 2.

---

## 6. Miniature, captures, vidéo

Poki indique que **la miniature statique est le facteur n°1 du taux de clic**, que les joueurs préfèrent les miniatures **sans texte**, qu'il faut la tester en grand et en petit format, éviter une teinte proche du **fond turquoise** de Poki, et qu'elle doit être **honnête** car elle réapparaît avant le jeu ✅ ([Game thumbnail](https://developers.poki.com/guide/game-thumbnail), [Reading results](https://developers.poki.com/guide/reading-results)). Une **vidéo de survol** est requise avant la sortie mondiale : carré 1:1, 4–6 s, muette, .mp4, ≤ 100 Mo ✅.

### Brief miniature (v1, pour l'Agent Design)
- **Sujet :** le pilote, gros plan, visage **très expressif** (bouche ouverte, lunettes de travers) dans un avion **visiblement bricolé** (ailes dépareillées, hélice trop grande, une roue qui pend), en **piqué vers une petite piste**, à 1 seconde de l'atterrissage.
- **Lecture en 1 seconde :** « avion + pilote + ça va être juste ». Pas de texte, pas de logo.
- **Composition :** pilote et avion occupent ~60 % du cadre, diagonale haut-gauche → bas-droite (mouvement), piste/ville en bas.
- **Couleurs :** ciel **orange/jaune de fin de journée** ou bleu très saturé + avion rouge/jaune → contraste fort avec le turquoise Poki. Contours épais.
- **Variante B à tester :** splash dans l'eau (WATER CRASH) avec pilote ahuri — plus drôle, mais montre un échec.
- **Tests :** lisibilité à 100 × 100 px ; comparaison côte à côte avec la catégorie Airplane de Poki.

### Captures d'écran (5)
1. Atelier : avion bricolé sur la grille, stats visibles.
2. Vol au-dessus de la Manche avec Londres au loin.
3. Approche tendue : piste étroite vs champ sûr (choix tactique visible).
4. Écran de résultats « PERFECT LANDING » avec pilote personnalisé.
5. Carte du voyage Paris → Istanbul avec villes débloquées.

### Vidéo de survol (4–6 s, 2–3 plans)
Assemblage d'une aile (1 s) → décollage (1,5 s) → atterrissage raté comique OU parfait (2 s). Aucune UI non essentielle, pas de curseur.

---

## 7. Description Poki (brouillons)

**EN (court, ~80 mots)**
> Build your own plane, fly it… and try to land it! Snap together wings, engines, propellers and wheels — every part has a trade-off. Big wings lift more but slow you down; a huge engine is fast but heavy. Take off from Paris and fly to London, Amsterdam, Berlin and beyond. Steer through wind, gusts and obstacles, then choose your landing: the tricky runway or the safe field? Perfect landings earn big rewards. Water landings… don't. Customize your pilot and unlock new parts and cities!

**FR**
> Construis ton avion, pilote-le… et essaie de le poser ! Assemble ailes, moteurs, hélices et roues : chaque pièce a ses avantages et ses défauts. De grandes ailes portent mieux mais freinent, un gros moteur pousse fort mais pèse lourd. Décolle de Paris et vole vers Londres, Amsterdam, Berlin et plus loin. Affronte le vent et les obstacles, puis choisis : la piste difficile ou le champ plus sûr ? Un atterrissage parfait rapporte gros. Dans l'eau… beaucoup moins. Personnalise ton pilote et débloque de nouvelles pièces et villes !

**Contrôles (à afficher sur la page) :** Clavier : ↑/↓ ou W/S pour incliner, Espace/Shift pour les gaz (à confirmer par l'Agent Dev). Mobile : zones tactiles (à confirmer).

**Catégories / tags visés (🔵 à confirmer avec les catégories réelles de Poki) :** Airplane, Building, Physics, Skill, Casual, Funny.

---

## 8. Rétention et viralité (compatibles Poki)

Rappel des contraintes : **pas de liens externes directs** (doivent passer par le SDK), **pas de requêtes externes** par défaut, pas de backend obligatoire ✅ ([Requirements](https://developers.poki.com/guide/requirements-quality)). Donc pas de classement en ligne ni de partage social natif au lancement.

### Crochets de rétention en session (priorité haute)
1. **Chaque vol rapporte** (même un WATER CRASH) → jamais de session « pour rien ».
2. **« Encore un » visible** : sur l'écran de résultats, montrer **la prochaine pièce à débloquer et la barre de progression** vers elle (« plus que 40 pièces d'or ! »).
3. **Record personnel affiché pendant le vol** (fantôme / drapeau « ton record » sur le terrain).
4. **Choix de construction suggéré** après un échec (« Ton avion était trop lourd pour décoller : essaie des ailes plus grandes ») → l'échec devient une piste.
5. **Défis courts** par destination (3 badges bronze/argent/or).

### Crochets de retour (J1+)
- Sauvegarde locale robuste (le joueur retrouve son pilote et son avion).
- Carte du voyage à compléter (effet collection).
- 🔵 Défi du jour local (généré à partir de la date, sans serveur) — **secondaire, après MVP**.

### Viralité « organique »
- **Crashs drôles et lisibles** = moments que les enfants montrent à leurs voisins de classe / filment. Le crash doit être **spectaculaire mais compréhensible**.
- **Phrases de résultats mémorables** (« L'eau n'était pas une piste d'atterrissage ! »).
- **Nom d'avion aléatoire drôle** généré à la construction (« Le Frigo Volant ») → les joueurs en parlent.
- 🔵 Capture/« carte postale » de résultat téléchargeable : **à vérifier avec Poki** (fonctionnalités de partage SDK / restrictions), donc **reporté**.

---

## 9. KPIs et objectifs

Chiffres officiels (extraits) ✅ ([How testing works](https://developers.poki.com/guide/how-testing-works), [Player fit test](https://developers.poki.com/guide/player-fit-test), [Reading results](https://developers.poki.com/guide/reading-results)) :
- **Player Fit Test** : ~500 joueurs, mesure **uniquement le temps de jeu**. Seuil pour passer : **moyenne > 3 min** et **≥ 25 % des parties > 3 min**.
- **Web Fit Test** : ~10 000 joueurs, comparé à la **moyenne de la catégorie** : **CTR**, **temps sur la page**, **conversion-to-play**.
- **Objectifs de base** : **≥ 65 % de conversion-to-play**, **≥ 5 min de temps de jeu moyen**. Jeu Poki moyen : ~70 % et 6+ min.

| KPI | Définition | Objectif interne | Leviers |
|---|---|---|---|
| CTR miniature | clics / impressions | ≥ moyenne catégorie Airplane | Miniature, vidéo de survol |
| Conversion-to-play (C2P) | joueurs qui commencent à jouer / joueurs qui chargent | **≥ 70 %** | Poids initial < 8 Mo (cible 5), 1er vol en < 20 s |
| Temps de jeu moyen | durée moyenne par joueur | **≥ 7 min** (5 min = plancher) | Boucle courte, récompenses, déblocages fréquents au début |
| % parties > 3 min | | **≥ 40 %** | Premier déblocage avant 3 min |
| Rétention J1 | joueurs revenant le lendemain | 🔵 à mesurer (pas d'objectif officiel trouvé) | Carte à compléter, sauvegarde |
| Taux de PERFECT au 1er vol | | 15–30 % | Équilibrage : l'atterrissage doit sembler faisable |

**Implication design majeure :** le premier **déblocage** doit arriver **avant la 3e minute**, et le joueur doit avoir fait **au moins 2 vols avant 3 min**. À transmettre à l'Agent Économie.

---

## 10. Plan de test et lancement

Processus Poki (✅ extraits [Adding your game](https://developers.poki.com/guide/adding-your-game), [Web fit test](https://developers.poki.com/guide/web-fit-test)) : soumission via le formulaire / plateforme **Poki for Developers** (accès en bêta fermée, Poki recontacte si le jeu convient) → **playtests enregistrés** (vidéos de vrais joueurs) → **Player Fit Test** (débloqué après visionnage d'au moins 10 enregistrements) → **Web Fit Test** → revue finale (qualité, originalité, adéquation catégorie). Durée du Web Fit Test : ~7 jours selon la doc Poki (3–5 jours selon une source tierce).

| Étape | Quand | Objectif |
|---|---|---|
| 1. Tests internes « 5 secondes » | Phase 2 (prototype) | 5–10 personnes hors projet (dont 2–3 enfants 9–14 ans) : comprennent-elles quoi faire sans explication ? |
| 2. Test miniature | Fin phase 3 | 3 miniatures comparées (sondage simple) |
| 3. Soumission Poki + playtests | Fin MVP (phase 3) | Les playtests Poki sont le meilleur outil gratuit : on regarde où les joueurs décrochent |
| 4. Player Fit Test | Après corrections | Passer > 3 min de moyenne |
| 5. Web Fit Test | Phase 5 | CTR / C2P / temps vs catégorie |

**Recommandation :** soumettre à Poki **dès que le MVP est jouable** (pas après le polish complet) : les playtests Poki valent plus que nos suppositions.

---

## 11. Risques marketing

| Risque | Gravité | Mitigation |
|---|---|---|
| Ressemblance perçue avec *Learn to Fly* / *Build League* | Moyenne | Mettre l'atterrissage et le voyage au premier plan ; pas de pingouin, pas de blocs 3D ; nom distinctif |
| Catégorie Airplane saturée → CTR faible | Haute | Miniature centrée sur le pilote expressif et l'avion bricolé ; couleurs chaudes |
| Concept trop riche → premier vol trop tardif | **Haute** | Avion pré-construit au 1er lancement ; atelier introduit après le 1er vol |
| Contrôles mobiles imprécis → mauvais avis, faible playtime (50 % du trafic) | Haute | Tests mobiles dès le prototype |
| Atterrissage perçu comme injuste → abandon | Haute | Feedback clair (indicateur de vitesse verticale/angle), seuils tolérants au début |
| Nom non protégeable / conflit de marque | Faible-moyenne | Recherche d'antériorité avant phase 5 |
| Villes réelles (Paris, Londres…) et monuments | Faible | Monuments stylisés génériques, pas de marques ni logos réels |

---

## 12. Décisions à valider par le porteur du projet

1. **Nom :** garder « CAN YOU FLY? » comme nom de code et décider du nom final après tests (recommandé), ou figer maintenant ?
2. **Accroche principale :** « Build it. Fly it. Now land it. »
3. **Cible primaire 8–16 ans, mobile = moitié du trafic** → contrôles tactiles prioritaires dès le prototype.
4. **Premier lancement avec avion pré-construit** (vol en < 20 s), atelier après le 1er vol.
5. **Soumission à Poki dès le MVP** pour utiliser les playtests.
6. **Langues :** lancement EN + FR, puis EFIGS (recommandation Poki : EFIGS en priorité).

## 13. Points à aligner avec les autres agents

- **Dev :** poids initial **< 5 Mo** (cible interne, 8 Mo max officiel), chargement < 10 s, fonctionne en navigation privée, `gameLoadingFinished` pour mesurer la C2P, textes centralisés dans un fichier unique (localisation).
- **Design / DA :** le pilote est l'icône marketing → il doit être lisible à 100 px ; prévoir une pose « miniature ». Crashs spectaculaires mais lisibles. Générateur de noms d'avions drôles (optionnel).
- **Économie :** 1er déblocage < 3 min, ≥ 2 vols < 3 min, toute partie rapporte ; aucune pub récompensée bloquante.
