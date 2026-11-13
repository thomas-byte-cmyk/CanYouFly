# POKI_COMPLIANCE — Check-list des exigences Poki

> **Auteur :** Agent 3 — Marketing & Product Growth · **Phase :** 1 (conception) · **Date de lecture :** 2026-11-13
> **Statut :** check-list de conception. **À relire intégralement sur les pages officielles avant l'intégration du SDK (phase 3) et avant la soumission (phase 5).**

## ⚠️ Avertissement sur la vérification

Les trois pages demandées n'ont **pas pu être ouvertes directement** depuis l'environnement de travail :

| Page | Accès direct | Méthode utilisée |
|---|---|---|
| https://developers.poki.com/guide/requirements-quality | ❌ bloqué (proxy réseau, HTTP 403) | extraits indexés par le moteur de recherche |
| https://developers.poki.com/guide/sdk-overview | ❌ bloqué | extraits indexés |
| https://developers.poki.com/guide/how-monetization-works | ❌ bloqué | extraits indexés + doc `sdk.poki.com` |

**Légende :**
- ✅ **Vérifié (extrait officiel)** — formulation issue d'un extrait d'une page `developers.poki.com` ou `sdk.poki.com`.
- 🟡 **Secondaire** — source tierce (blog, guide), cohérente mais non confirmée par Poki.
- 🔵 **Supposé** — déduction ou bonne pratique, non trouvée dans la doc.

➡️ **Action de suivi (issue à créer) :** une personne avec un navigateur normal relit les pages officielles et met à jour ce fichier (colonne « Statut »).

---

## 1. Modèle économique et accord

| # | Exigence | Statut | Source | Impact sur notre conception |
|---|---|---|---|---|
| M1 | **Pas d'achats intégrés** ; le système publicitaire Poki est la seule forme de monétisation. Retirer toute UI d'achat de monnaie ou de suppression des pubs. | ✅ | [requirements-quality](https://developers.poki.com/guide/requirements-quality) | Aucune boutique en argent réel, aucun bouton « supprimer les pubs ». Monnaie virtuelle gagnée uniquement en jouant. |
| M2 | **Seul le système publicitaire de Poki** est autorisé ; aucun autre réseau/SDK publicitaire. | ✅ | requirements-quality | Pas de SDK tiers (AdMob, etc.). |
| M3 | Partage de revenus : **100 %** au développeur pour le trafic qu'il apporte lui-même, **50/50** pour le trafic venant de Poki. | ✅ (extrait sdk.poki.com) | [Working with Poki](https://sdk.poki.com/index.html) | Info business. Les conditions exactes dépendent de l'accord signé. |
| M4 | **Exclusivité web** demandée (le jeu n'est publié que sur Poki pour le web ouvert) ; durée par défaut évoquée : 5 ans. | ✅ exclusivité / 🟡 durée | sdk.poki.com ; [Deal types](https://sdk.poki.com/deals) ; [Cinevva](https://app.cinevva.com/guides/publish-game-poki) | **Décision du porteur :** ne pas publier sur CrazyGames, itch.io, etc. en parallèle. Une version mobile store reste à vérifier dans l'accord. |
| M5 | Monétisation essentiellement via **pubs récompensées (opt-in)** et pauses publicitaires. | 🟡 | [Cinevva — monetization](https://app.cinevva.com/guides/web-game-monetization) | Voir MONETIZATION_STRATEGY (Agent 4). |

## 2. Publicités et événements SDK

| # | Exigence | Statut | Source | Impact |
|---|---|---|---|---|
| A1 | Appeler `PokiSDK.init()` puis `gameLoadingFinished()` à la fin du chargement (sert à mesurer la conversion-to-play). | ✅ | [sdk-overview](https://developers.poki.com/guide/sdk-overview), [sdk-html5](https://developers.poki.com/guide/sdk-html5) | Écran de chargement → appel unique à la fin. |
| A2 | `gameplayStart()` quand le joueur commence à interagir (première entrée, début de niveau, reprise après pause). `gameplayStop()` quand le jeu s'arrête (pause, fin de niveau, mort, retour menu). | ✅ | sdk-overview | **Notre mapping proposé :** `gameplayStart` au décollage (ou à l'entrée dans l'atelier ? → à trancher par l'Agent Dev : l'atelier est-il du « gameplay » ?) ; `gameplayStop` à l'arrêt de l'avion (écran de résultats), à la pause, au retour carte. |
| A3 | `commercialBreak()` aux **pauses naturelles, juste avant de revenir dans le gameplay**. Tous les appels ne déclenchent pas une pub : Poki décide ; on peut signaler beaucoup d'opportunités. | ✅ | sdk-overview | Placement proposé : clic sur **« Revoler » / « Décoller »** après l'écran de résultats. Jamais pendant un vol. |
| A4 | `commercialBreak()` **uniquement en sortant d'une pause vers le gameplay** ; passer du gameplay à un écran de sélection de niveau est cité comme **mauvais** placement. | ✅ | requirements-quality | **Ne pas** placer de pub en ouvrant la carte du monde ou l'atelier. Placer la pub au moment de **relancer un vol**. |
| A5 | Séquence type : `gameplayStop()` → `commercialBreak()`/`rewardedBreak()` → `gameplayStart()`. Une pub qui n'interrompt pas le jeu (ex. débloquer un cosmétique depuis un menu) n'a pas besoin de stop/start. | ✅ | sdk-overview | Les pubs récompensées depuis l'atelier/garde-robe n'encapsulent pas de stop/start. |
| A6 | `rewardedBreak()` : choix **explicite** du joueur ; le callback indique si la pub a été vue (récompense uniquement si oui). Interagir avec une pub récompensée **réinitialise le minuteur** publicitaire. | ✅ | sdk-overview, sdk-html5 | Bouton clair « Regarder une pub pour ×2 récompense » ; gérer le cas « pub non disponible / non vue ». |
| A7 | **Le gameplay central ne peut pas être verrouillé derrière une pub récompensée** ; un bouton « continuer » standard doit toujours exister à côté du bouton récompensé. | ✅ | requirements-quality | Toute pub récompensée = **bonus optionnel**. Pas de « regarde une pub pour réparer l'avion ». |
| A8 | Aucun événement SDK ne doit pouvoir être déclenché **pendant** une pub (midroll ou récompensée). | ✅ | requirements-quality | Bloquer les entrées et l'UI pendant les pubs. |
| A9 | **Couper le son et l'entrée clavier pendant les pubs.** | ✅ (guides SDK moteurs) | [sdk-gdevelop](https://developers.poki.com/guide/sdk-gdevelop) | Le gestionnaire audio doit avoir un « mute global » commandé par le module pub. |
| A10 | Existence d'une intégration **Phaser 3** officielle (plugin pouvant appeler start/stop automatiquement). | ✅ | [sdk-phaser](https://developers.poki.com/guide/sdk-phaser) | Favorable au choix Phaser 3 (Agent Dev). Vérifier si le plugin vaut mieux qu'une intégration manuelle. |
| A11 | Pas de pub pendant un vol. | 🔵 (exigence du cahier des charges, cohérente avec A3/A4) | — | Règle interne absolue. |

## 3. Technique, chargement et performance

| # | Exigence | Statut | Source | Impact |
|---|---|---|---|---|
| T1 | Taille du **téléchargement initial < 8 Mo** ; réduire encore via chargement progressif. | ✅ (extrait sdk.poki.com) / 🟡 d'autres sources citent 5 Mo ou 20 Mo | [new-requirements](https://sdk.poki.com/new-requirements.html), [web-engine](https://developers.poki.com/guide/web-engine) | **Cible interne : < 5 Mo initial**, le reste (villes suivantes, musiques) chargé en arrière-plan. Phaser seul ≈ 1 Mo minifié (🔵 à mesurer). |
| T2 | Les joueurs partent si le chargement dépasse **~10 s** ; ils jouent depuis le monde entier. | ✅ | [web-engine](https://developers.poki.com/guide/web-engine) | Budget de chargement, audio compressé, atlas de sprites. |
| T3 | **30 FPS minimum, 60 FPS visés**, sur réseau standard (3G ou mieux). | ✅ (extrait page « deals ») | [Deal types](https://sdk.poki.com/deals) | Budget perf mobile bas de gamme ; physique simple. |
| T4 | **Requêtes externes bloquées par défaut** : tous les assets et bibliothèques doivent être embarqués. Exceptions via la CSP personnalisée dans les réglages du jeu, avec politique de confidentialité hébergée. | ✅ | requirements-quality, [External resources](https://sdk.poki.com/external-resources) | Pas de CDN, pas de Google Fonts en ligne, pas d'analytics tiers. Polices et libs dans le build. |
| T5 | Doit fonctionner en **navigation privée** : `localStorage` restreint → l'envelopper dans try/catch ; le jeu doit rester jouable. | ✅ | requirements-quality | Couche de sauvegarde avec repli mémoire (Agent Dev). |
| T6 | Sauvegarde : pas de backend requis ; progression automatique avec compte Poki mentionnée sur certaines pages de jeux. | 🟡 | [Drive Mad sur Poki](https://poki.com/en/g/drive-mad) | 🔵 Vérifier si le SDK propose un stockage cloud lié au compte Poki ; sinon `localStorage` seul. |

## 4. Mobile et contrôles

| # | Exigence | Statut | Source | Impact |
|---|---|---|---|---|
| D1 | Sur mobile, **couvrir tout l'écran** en portrait ou paysage (ou les deux, idéalement). | ✅ | requirements-quality | **Décision à prendre :** paysage uniquement (naturel pour un jeu de profil) ou support portrait ? Recommandation marketing : **paysage obligatoire + écran « tourne ton téléphone » soigné** ; portrait = bonus si coût faible. |
| D2 | **Forcer les contrôles mobiles sur tablette.** | ✅ | requirements-quality | Pas de clavier virtuel ; détection tactile → UI tactile. |
| D3 | Expérience cohérente sur toutes les tailles d'écran et méthodes d'entrée. | ✅ | [sdk-documentation](https://sdk.poki.com/sdk-documentation) | Layout responsive, zones tactiles ≥ 44 px (🔵 bonne pratique). |

## 5. Liens, contenu, données

| # | Exigence | Statut | Source | Impact |
|---|---|---|---|---|
| C1 | Les boutons ouvrant des liens externes (YouTube, Discord…) doivent **passer par l'appel SDK dédié**, pas un lien direct. | ✅ | requirements-quality | Aucun lien externe prévu au lancement. |
| C2 | Si le jeu fait des liens externes (même pour exemption analytics), une **politique de confidentialité accessible en jeu** et hébergée (pas un Google Doc) est requise. | ✅ | requirements-quality | Raison de plus pour **zéro lien externe** au lancement. |
| C3 | Accès instantané, **pas de mur de connexion**. | 🟡 | [post X autonomous games](https://x.com/autonom_games/status/2069642887164510699) | Aucun compte, jeu immédiat. |
| C4 | Contenu **adapté aux enfants**, pas de jeux d'argent, pas de crypto. | 🟡 | idem | Humour cartoon, aucune blessure ; pas de « loot box » ni roue payante. 🔵 Éviter aussi les mécaniques de type gacha avec la monnaie virtuelle. |
| C5 | Revue finale Poki : **qualité, originalité, adéquation à la catégorie**. | 🟡 | [Cinevva](https://app.cinevva.com/guides/publish-game-poki) | Jeu original, pas de reprise d'un jeu existant. |

## 6. Localisation

| # | Exigence | Statut | Source | Impact |
|---|---|---|---|---|
| L1 | Priorité recommandée : **EFIGS** (EN, FR, IT, DE, ES), puis CJK, puis PT-BR et RU. | ✅ (recommandation) | [localization](https://developers.poki.com/guide/localization) | Lancement **EN + FR** minimum, EFIGS en phase 4–5. |
| L2 | Tous les textes **au même endroit** (ex. un fichier JSON) ; tester chaque langue avec le sélecteur de langue de **Poki Inspector**. | ✅ | localization | Aucune chaîne en dur ; textes courts (place pour l'allemand). |
| L3 | Langues ajoutables après la sortie. | ✅ | [post-release-updates](https://developers.poki.com/guide/post-release-updates) | Pas besoin de tout traduire pour la sortie. |

## 7. Processus de soumission et tests

| # | Étape | Statut | Source | Impact |
|---|---|---|---|---|
| P1 | **Poki for Developers** (P4D) : plateforme en **bêta fermée** ; candidature via formulaire, Poki recontacte si le jeu convient. | ✅ | [p4d-platform](https://developers.poki.com/guide/p4d-platform), [What is P4D](https://sdk.poki.com/what-is-p4d) | **Blocage potentiel :** l'accès n'est pas garanti. Candidater tôt (dès prototype convaincant). |
| P2 | **Poki Inspector** : outil QA avant lancement (usage du SDK, comportement mobile, exigences techniques), accessible depuis l'onglet Versions. | ✅ | [Poki Inspector](https://sdk.poki.com/poki-inspector) | Passage systématique avant chaque version soumise (phase 3 et 5). |
| P3 | **Playtests** enregistrés → **Player Fit Test** (~500 joueurs, temps de jeu uniquement ; débloqué après ≥ 10 enregistrements visionnés). Seuil : **moyenne > 3 min et ≥ 25 % des parties > 3 min**. | ✅ | [player-fit-test](https://developers.poki.com/guide/player-fit-test), [how-testing-works](https://developers.poki.com/guide/how-testing-works) | Objectif de design : 1er déblocage < 3 min. |
| P4 | **Web Fit Test** (~10 000 joueurs) : CTR, temps sur la page, conversion-to-play, comparés à la moyenne de la catégorie. Durée ~7 jours (doc Poki) / 3–5 jours (tierce). | ✅ / 🟡 durée | [web-fit-test](https://developers.poki.com/guide/web-fit-test) | Miniature et C2P critiques. |
| P5 | Objectifs repères : **≥ 65 % C2P**, **≥ 5 min** de temps de jeu moyen ; jeu moyen ~70 % et 6+ min. | ✅ | [reading-results](https://developers.poki.com/guide/reading-results) | Repris dans MARKETING_STRATEGY §9. |
| P6 | **Miniature** : sans texte recommandé ; contraste avec le fond turquoise Poki ; **vidéo de survol** requise avant la sortie mondiale (1:1, 4–6 s, muette, .mp4, ≤ 100 Mo). Changements de miniature après le Web Fit Test soumis à approbation. | ✅ | [game-thumbnail](https://developers.poki.com/guide/game-thumbnail) | Brief miniature dans MARKETING_STRATEGY §6. |

---

## 8. Synthèse : règles de conception qui découlent de Poki

1. **Zéro achat, zéro pub tierce, zéro lien externe, zéro requête réseau externe** au lancement.
2. **Pubs interstitielles** (`commercialBreak`) uniquement au moment de **relancer un vol** ; **jamais** pendant un vol, **jamais** en ouvrant un menu.
3. **Pubs récompensées** = bonus optionnels, toujours avec une alternative gratuite visible.
4. **Son et entrées coupés** pendant les pubs.
5. **< 8 Mo initial (cible 5 Mo)**, chargement < 10 s, **30–60 FPS** sur mobile modeste.
6. **Navigation privée** : le jeu reste jouable sans stockage.
7. **Plein écran mobile**, contrôles tactiles forcés sur tablette.
8. **Textes centralisés** pour la localisation (EN + FR au départ).
9. **Candidater à P4D tôt** : l'accès n'est pas garanti (bêta fermée).

## 9. Questions ouvertes à vérifier sur les pages officielles

- Fréquence minimale entre deux `commercialBreak` (gérée par Poki ? règle à respecter de notre côté ?).
- Existence d'un stockage cloud / sauvegarde liée au compte Poki via le SDK.
- Taille initiale exacte exigée (8 Mo confirmé ? limite totale ?).
- Exigences précises sur l'orientation (paysage seul accepté ?).
- Fonctions SDK de partage (URL partageable, capture) et conditions.
- Conditions de l'exclusivité (durée, versions mobiles natives autorisées ?).
