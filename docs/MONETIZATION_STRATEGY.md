# MONETIZATION_STRATEGY — Publicités Poki et modèle économique

> Statut : **proposition Phase 1 — à valider**. Auteur : Agent 4 (Monetization & Game Economy).
> Les règles Poki **doivent être revérifiées** sur la documentation officielle au moment de l'intégration du SDK (Phase 3).

---

## 1. Sources consultées (13/11/2026) et niveau de fiabilité

> ⚠️ Limite de vérification : depuis l'environnement de travail, l'accès direct à `developers.poki.com` a été **refusé par le proxy réseau**. Les règles ci-dessous proviennent des **extraits des pages officielles Poki** remontés par la recherche web (developers.poki.com et sdk.poki.com), complétés par des sources tierces clairement marquées. Une relecture directe des pages est une **tâche obligatoire** avant l'intégration (issue dédiée).

| Source | Type | Utilisée pour |
|---|---|---|
| https://developers.poki.com/guide/how-monetization-works | Officielle (extraits) | Modèle publicitaire, formats |
| https://developers.poki.com/guide/sdk-overview | Officielle (non lue en entier) | — |
| https://developers.poki.com/guide/requirements-quality | Officielle (non lue en entier) | — |
| https://sdk.poki.com/new-requirements | Officielle (extraits) | Interdictions, gameplayStart |
| https://sdk.poki.com/sdk-documentation.html | Officielle (extraits) | Séquences d'événements |
| https://sdk.poki.com/html5.html, https://sdk.poki.com/phaser | Officielle (extraits) | API rewardedBreak, son/inputs |
| https://app.cinevva.com/guides/publish-game-poki, https://www.bountyboard.gg/blog/how-to-monetize-an-html5-game, https://playfox.org/news/indie-dev-revenue/ | **Tierces** | Partage de revenus, ordres de grandeur |

---

## 2. Règles Poki

### 2.1 Vérifiées (extraits officiels)

| Règle | Source |
|---|---|
| Les jeux gagnent **uniquement via les publicités servies par le SDK Poki**. Pas d'achats intégrés, pas de système publicitaire tiers. | how-monetization-works |
| Deux formats : **publicités midroll** (commercialBreak) aux pauses naturelles, et **vidéos récompensées** (rewardedBreak) au choix du joueur. | how-monetization-works |
| « Rewarded content is always an optional extra and **never blocks core gameplay**. » | how-monetization-works |
| Aucune autre publicité dans le jeu ; les éléments d'UI pour **acheter de la monnaie ou retirer les pubs doivent être supprimés**. | new-requirements |
| `gameplayStart()` doit être déclenché **à la première interaction du joueur**, pas au chargement. Pas de double `gameplayStart()` sans `gameplayStop()` entre les deux. | new-requirements |
| `commercialBreak()` : à appeler aux pauses naturelles, recommandé **avant chaque `gameplayStart()`** quand le joueur montre son intention de continuer. **Tous les appels ne déclenchent pas une pub : Poki décide** quand le joueur est prêt pour une nouvelle pub (« feel free to signal as many commercial break opportunities as possible »). | sdk.poki.com (guides moteurs) |
| `rewardedBreak()` retourne un booléen de succès : on n'accorde la récompense que si `true`. Le joueur doit savoir **avant** qu'il va regarder une pub. | sdk.poki.com/html5 |
| Un rewardedBreak **réinitialise le minuteur publicitaire** de Poki (pas de pub juste après). | sdk.poki.com |
| Pendant une pub : **couper le son et désactiver les entrées** du jeu. | sdk.poki.com (Phaser, GDevelop) |
| Séquences types : mort + recommencer = `gameplayStop → commercialBreak → gameplayStart` ; revivre = `gameplayStop → rewardedBreak → gameplayStart` ; pause = `gameplayStop → gameplayStart`. | sdk-documentation |
| Test dans le **Poki Inspector** avant demande de revue. | sdk.poki.com |

### 2.2 Supposé / à vérifier

- Partage de revenus : **50/50 sur le trafic apporté par Poki, 100 % pour le développeur sur le trafic qu'il apporte** (sources tierces ; chiffres fixés par contrat). → À confirmer dans les pages officielles « revenue & deal types ».
- Durée/exclusivité web du contrat (sources tierces : exclusivité web, ~5 ans). → À lire avant soumission.
- Contraintes exactes de taille de build initial et de comportement sur mobile : voir `requirements-quality` (Agent 1 / Agent 3).
- Existence d'un plafond explicite de fréquence côté développeur : **non trouvé**. La doc indique que Poki régule lui-même. Nous ajoutons malgré tout nos propres garde-fous (§5).

---

## 3. Ce qui est interdit dans CAN YOU FLY?

- ❌ Achats intégrés, monnaie achetable, « retirer les pubs ».
- ❌ SDK publicitaire tiers, bannières maison, liens sortants promotionnels.
- ❌ Toute publicité **pendant un vol** (de la pression sur « Décoller » jusqu'à l'apparition de l'écran de résultats).
- ❌ Pub récompensée **obligatoire** pour progresser, ou progression calibrée pour « forcer » la pub.
- ❌ Pub déclenchée sans action explicite du joueur pour un rewarded ; récompense accordée si la pub a échoué.
- ❌ Récompense récompensée « déguisée » en bouton principal (le bouton gratuit doit toujours être le plus visible).

---

## 4. Interstitiels (`commercialBreak`)

### 4.1 Placement

Le jeu a un rythme naturel idéal : **un vol = une partie**. Le point d'appel unique et prévisible est :

```
Écran de résultats → [Rejouer] ou [Retour au hangar → … → Décoller]
                      ↓
gameplayStop (déjà fait à la fin du vol) → commercialBreak() → gameplayStart() au décollage
```

- On appelle `commercialBreak()` **au moment où le joueur lance un nouveau vol** (bouton *Décoller* / *Rejouer*), jamais en entrant ou en sortant du hangar, jamais pendant la construction.
- **Pas d'appel avant le tout premier vol de la session** (règle maison : on laisse le joueur découvrir le jeu sans friction ; à confirmer compatible avec les recommandations Poki).
- Le hangar (construction) **n'est pas du gameplay chronométré** : on recommande `gameplayStart()` au décollage et `gameplayStop()` à l'arrêt de l'avion. À valider avec l'Agent 1 : si Poki considère la construction comme du gameplay, `gameplayStart()` dès la première interaction dans le hangar.

### 4.2 Fréquence

Poki décide si l'appel débouche réellement sur une pub. Garde-fous maison supplémentaires (config `ads.json`) :
- Ne pas signaler d'opportunité si le dernier vol a duré **< 15 s** (crash au décollage : le joueur veut retenter immédiatement — une pub ici est la pire expérience possible). Valeur initiale à tester.
- Ne pas signaler d'opportunité dans les **60 s** qui suivent un rewarded regardé (Poki réinitialise déjà son minuteur ; ceinture + bretelles).

> Débat : ces filtres réduisent le nombre d'opportunités signalées, et Poki recommande d'en signaler « autant que possible ». Le risque revenu est faible (Poki aurait probablement refusé une pub si rapprochée) et le gain d'expérience est fort. À vérifier dans les stats après lancement.

---

## 5. Publicités récompensées (`rewardedBreak`) — candidats et critique

| # | Placement | Verdict | Analyse |
|---|---|---|---|
| R1 | **Doubler les Boulons du vol** (écran de résultats) | ✅ **MVP** | Classique, compris de tous, le joueur choisit. Risque : si la base est calibrée trop bas, le joueur sans pub se sent lésé → la base est calibrée pour le joueur **sans pub** (voir `PROGRESSION_SYSTEM.md`). Bouton secondaire, sous « Continuer ». Proposé seulement si le gain du vol ≥ 30 Boulons (doubler 10 Boulons n'a pas de sens et banalise la pub). |
| R2 | **Essayer une pièce non débloquée pour 1 vol** (hangar, pièces du catalogue visible) | ✅ **MVP (si temps) / sinon MVP+** | Excellent : sert l'expérimentation, crée du désir, aide le joueur bloqué. Ne doit **pas** permettre d'essayer une pièce d'une ville non atteinte (préserve la découverte). Limite : 1 essai à la fois. |
| R3 | **Cosmétique mystère** (boutique pilote, 1 fois par session) | 🟡 Post-MVP | Inoffensif, mais faible valeur perçue au début. Utile en fin de jeu comme puits d'engagement. |
| R4 | **Bonus de départ** : un boost de carburant / « vent favorable » pour le prochain vol | 🟡 À tester | Aide les joueurs bloqués. Risque : le jeu peut sembler calibré pour l'aide. On ne le propose **qu'après 3 échecs consécutifs** sur une étape et en complément des aides gratuites (`DIFFICULTY_BALANCING.md` §6). |
| R5 | **Seconde chance en vol** (après un crash : reprendre le vol quelques secondes avant) | ❌ Rejeté pour le MVP | Viole l'esprit « LAND OR CRASH », retire la tension de l'atterrissage, et exige un snapshot/rejouabilité de la physique (coût technique). Peut-être pour la *croisière*, jamais pour l'atterrissage. |
| R6 | **Réparer l'avion** | ❌ Rejeté | Les dégâts ne sont pas persistants (brief §7.4) → il n'y a rien à réparer. Créer des dégâts persistants pour vendre une réparation serait de la frustration artificielle. |
| R7 | **Débloquer une destination** sans l'atteindre | ❌ Rejeté | Détruit la progression géographique, cœur du jeu. |

**Règle générale** : au maximum **un** bouton rewarded visible par écran.

---

## 6. Garde-fous anti-frustration (engagements)

1. Un joueur qui ne regarde **aucune** pub termine le MVP dans la durée cible (1 h 30 – 2 h 30). Ce sera un **critère d'acceptation** de l'équilibrage (simulation de progression sans R1).
2. Aucun écran ne s'ouvre automatiquement pour proposer une pub.
3. Pas de pub pendant : vol, construction, carte, personnalisation du pilote.
4. Son et inputs coupés pendant la pub, reprise propre (pas de clic fantôme sur « Décoller »).
5. Si la pub échoue ou est bloquée (adblock) : le jeu continue normalement, sans message culpabilisant ; R1/R2 affichent simplement « indisponible ».

---

## 7. Potentiel économique (qualitatif)

- Le revenu sur Poki est **proportionnel au temps de jeu** (nombre de pubs vues) et au volume de trafic que Poki accorde, lui-même lié aux métriques de rétention/conversion du jeu en test (hypothèse, cohérente avec la communication publique de Poki).
- Notre levier n°1 n'est donc pas la pub mais la **rétention** : temps de session, retour du joueur, envie de « encore un vol ».
- CAN YOU FLY? a une structure favorable : parties courtes (1–2 min), nombreuses pauses naturelles, forte rejouabilité → beaucoup d'opportunités d'interstitiels **sans** interrompre le jeu.
- Ordre de grandeur (sources **tierces**, non vérifié) : un jeu casual qui performe bien sur un grand portail rapporterait ~200–2 000 $/mois ; les meilleurs partenaires Poki jusqu'à ~1 M€/an. **À ne pas utiliser comme prévision** : la distribution est très inégale et la majorité des jeux restent en dessous.
- Aucun CPM n'est avancé ici : aucune source fiable n'a été trouvée.

---

## 8. Intégration (résumé pour l'Agent 1)

| Moment | Appel SDK |
|---|---|
| Chargement terminé | `gameLoadingFinished()` (à vérifier, nom exact selon SDK) |
| Première interaction réelle | `gameplayStart()` |
| Fin de vol (avion immobile / crash) | `gameplayStop()` |
| Clic *Décoller* / *Rejouer* (sauf 1ᵉʳ vol et filtres §4.2) | `commercialBreak()` puis `gameplayStart()` |
| Clic *Doubler mes Boulons* | `rewardedBreak()` → si `true` : crédit |
| Pause / onglet masqué | `gameplayStop()` / `gameplayStart()` |

Toute la configuration (activation de R1–R4, seuils, filtres) dans `ads.json` pour pouvoir ajuster sans recompiler.
