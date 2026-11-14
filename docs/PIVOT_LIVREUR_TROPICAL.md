# Pivot : Pip, livreur de colis aux îles

> **Statut** : direction validée par le porteur du projet le 14/11/2026 (décisions D17 à D20). Prototype v0.6 en attente de feu vert.
> Nom de code inchangé : **CAN YOU FLY?**

---

## 1. Vision en une page

**Pip est un « partenaire indépendant » de *LivrÎle*, la société de livraison qui promet « Livré en 30 minutes ou presque ». Sans casque, sans assurance, avec un avion bricolé, Pip livre des colis absurdes aux habitants d'un archipel tropical dont les îles rétrécissent un peu plus à chaque marée.**

**Boucle de jeu (une partie ≈ 2 à 3 minutes) :**

```
LIRE LA COMMANDE ─→ ADAPTER L'AVION AU COLIS ─→ VOLER D'ÎLE EN ÎLE ─→ LIVRER EN ATTERRISSANT
      ↑                   (hangar)                                          │
      └── COMMANDE SUIVANTE ←── NOUVELLES PIÈCES ←── NOTE CLIENT + BOULONS ←─┘
```

**Ce qui rend le jeu différent de la v0.5 :**
1. **Le colis donne une raison de modifier l'avion.** Le hangar n'est plus « trouver le meilleur avion » mais « trouver le bon avion *pour ce colis* ». Un frigo exige un gros moteur et un train solide ; des œufs exigent un avion qui se pose comme une plume ; un canoë sur le toit freine tout.
2. **Chaque atterrissage a un enjeu lisible.** Le colis fixe la règle du jour : « pas plus brutal que BON », « piste de 40 m », « avant que la glace ne fonde ». La difficulté vient du colis, pas d'obstacles injustes.
3. **L'humour a un support naturel.** Commandes, messages clients, notes ★☆☆☆☆ et phrases de Pip : la satire de la livraison express et des avis en ligne parle aux enfants (ils voient leurs parents noter des livreurs) comme aux adultes.

**Ce que le joueur doit ressentir :** « Ce colis est absurde, mon avion n'est pas fait pour ça… je vais bricoler un truc, et si ça rate, au moins le client va écrire un avis hilarant. »

---

## 2. Ce qu'on garde

| Élément | Décision d'origine | Statut |
|---|---|---|
| Vol à un doigt (droite = monter, gauche = piquer, arrondi automatique) | D16 | ✅ Gardé tel quel |
| Comportement en vol calculé à partir des pièces | T10 | ✅ Gardé : c'est lui qui rend le colis « réel » (masse, centre de gravité, traînée) |
| Hangar à emplacements | D1 | ✅ Gardé, avec un ou plusieurs **emplacements de colis** en plus |
| Boulons, pas d'améliorations de caractéristiques | D4, D10 | ✅ Gardés |
| Pip, sans genre marqué, cosmétiques superposés | D8 | ✅ Gardé, avec une tenue de livreur, un bob et un gilet fluo de la société |
| Atterrissage noté (PERFECT → WATER) et aides | — | ✅ Gardé, et **central** |
| Données en JSON, physique testable, CI, GitHub Pages | T1–T9 | ✅ Gardé |
| Zéro budget | D9 | ✅ Gardé |
| Cible 8–16 ans + familles, mobile, FR + EN | D12 / D20 | ✅ Gardée |
| Pas de flotteurs dans le MVP | D7 / D19 | ✅ Maintenue |
| Monétisation Poki (pub au clic « Livraison suivante », pubs récompensées facultatives) | D10 | ✅ Gardée, placements à réadapter (§6) |

## 3. Ce qu'on jette

| Élément | Remplacé par |
|---|---|
| Carte Europe Paris → Istanbul, 8 étapes (D6) | Archipel de 9 îles (D17, §5) |
| Étape Paris → Reims, ses décors (tour Eiffel, vignes, cathédrale) | Île du Dépôt (tutoriel) et premières îles |
| « Atteindre la ville » comme objectif | « Livrer le colis » avec un état (intact / cabossé / en miettes / à l'eau) |
| Récit « Départ de Paris… » | Récit de livraison + **note client** de 1 à 5 étoiles |
| Souvenirs de ville (cosmétiques) | Cadeaux de clients (cosmétiques absurdes) |
| `docs/WORLD_MAP.md` | À réécrire en carte de l'archipel (v0.6) |

> Les fichiers ne sont pas supprimés : l'étape Paris → Reims reste dans le code comme **niveau de test** tant que les îles ne la remplacent pas.

## 4. Ce qui est réutilisable dans le code (état v0.5)

| Fichier | Réutilisation | Ce qui change |
|---|---|---|
| `src/sim/aero.ts`, `flight.ts` | 100 % | Rien. Le colis n'est qu'une **masse** et une **traînée** de plus |
| `src/sim/handling.ts` | 100 % | Les barres sont recalculées avec le colis à bord : le joueur voit l'avion « s'alourdir » |
| `src/sim/landing.ts` | 95 % | Tolérance multipliée par la **fragilité** du colis ; nouvel état du colis selon la sévérité |
| `src/sim/session.ts` | 85 % | Ajout de : chronomètre (colis urgents ou qui fondent), masse qui bouge (poules), longueur de zone exigée, résultat « livraison » |
| `src/sim/rewards.ts` | 70 % | Paiement = tarif du colis × état × ponctualité + pourboire ; note client 1–5 ★ |
| `src/sim/world.ts` + JSON d'étape | 90 % | Mêmes structures (sol, zones, obstacles, vent, oiseaux…) ; une île = des segments de terre courts au milieu de l'eau |
| `src/data/aircraft/*.json` | 100 % | Les 3 avions deviennent les 3 configurations de départ |
| Scènes Phaser (vol, HUD, pause, choix d'avion) | 80 % | Le choix d'avion devient « Adapter l'avion au colis » ; ajout de l'écran de commande |
| `ResultsScene` | 50 % | Réécrite en écran « Note client » |
| Rendu (`world.ts`, `plane.ts`, `pilot.ts`) | 60 % | Décors tropicaux (sable, palmiers, pontons), colis visible sur l'avion, tenue de livreur |
| Tests (39) | ~90 % | Les tests liés à Reims seront portés sur une île ; tests nouveaux pour chaque contrainte de colis |

**Conclusion : le pivot coûte surtout du contenu et de l'interface, pas du moteur.**

## 5. Le colis : comment il change l'avion

Chaque colis est un fichier JSON. Ses champs sont résumés ici.

| Champ | Effet en jeu | Brancher sur |
|---|---|---|
| `mass` | Plus lourd : décollage plus long, montée plus faible, atterrissage plus rapide | `computeAggregates` (masse ajoutée) |
| `slot` (soute avant, soute arrière, toit, sous l'aile) | Déplace le **centre de gravité** : à l'arrière, l'avion cabre tout seul | Position x de la masse |
| `drag` | Volumineux à l'extérieur : traînée, autonomie réduite | `drag.parasite` |
| `fragility` | Multiplie la tolérance d'atterrissage (0,5 = deux fois plus exigeant) | `evaluateTouchdown` |
| `maxGrade` | Brutalité acceptée (« BON ou mieux ») | Résultat de livraison |
| `minRunway` | Zone d'arrivée suffisamment longue exigée (sinon livraison refusée) | Zones de l'île |
| `timeLimit` | Chronomètre (glace qui fond, courrier) | `session` |
| `shifting` | Masse qui se déplace en vol (poules qui courent dans la soute) | Position x variable |
| `price`, `tip` | Paiement de base, pourboire si PARFAIT | `rewards` |

**Familles de colis (base du brief, à compléter) :**
- **Lourd** (groupe électrogène, frigo, piano de plage) : il faut un gros moteur et un train renforcé, et la piste doit être longue.
- **Fragile** (œufs, gâteau d'anniversaire, vaccins) : seuil d'impact très bas, PARFAIT ou presque.
- **Capricieux** (poules, glace qui fond, crabe vexé) : chronomètre ou centre de gravité qui bouge.
- **Volumineux** (canoë, matelas gonflable, parasol géant) : emplacement extérieur et traînée.
- **Urgent** (courrier avant la fermeture, maillot oublié) : vitesse et carburant.

**Règle de livraison (D5 adaptée par D18) :**
- **Livré** : l'avion s'arrête dans la zone d'arrivée de l'île, hors de l'eau. L'**état du colis** dépend de la note d'atterrissage et de sa fragilité : *Intact* (paiement plein), *Cabossé* (−30 %), *En miettes* (−70 %, le client râle mais signe).
- **Perdu en mer** : WATER CRASH, la livraison échoue. Pip reçoit quand même les Boulons de distance, sans jamais de « 0 » humiliant.
- **Refusé** : l'avion s'est posé ailleurs que dans la zone d'arrivée, ou sur une zone trop courte pour un colis lourd. Livraison ratée, mais l'avion est intact.

## 6. Les îles (9 îles, D17 remplace D6)

Une île = une courte étape (60–90 s de vol depuis l'île précédente) avec **une zone d'arrivée plus petite qu'à Reims**.

| # | Île | Zone d'arrivée | Météo | Client type | Blague récurrente |
|---|---|---|---|---|---|
| 0 | **Île du Dépôt** (tutoriel) | piste en terre battue | grand beau | le chef d'entrepôt | Le panneau « 0 jour sans incident » |
| 1 | **Île Cocotte** | plage courte | alizé léger | Mme Plumard, éleveuse de poules | Les poules ont plus d'abonnés que Pip |
| 2 | **Île du Phare Penché** | piste en pente | rafales | le gardien de phare, qui ne voit plus très bien | Le phare penche un peu plus à chaque visite |
| 3 | **Îlot Ponton** | ponton en bois de 30 m | calme plat | un pêcheur qui commande tout et ne sort jamais | La planche qui manque au bout du ponton |
| 4 | **Île Transat** | toit plat du bar de plage | soleil de plomb | des touristes qui veulent un selfie avec l'avion | « Le Wi-Fi est en panne, c'est pour ça qu'on a commandé un routeur… par avion » |
| 5 | **Île des Brumes** | prairie au sommet | brume | personne n'a jamais vu le client | Le client signe toujours « ??? » |
| 6 | **Île Orageuse** | piste courte entre deux palmiers | orages et alizés forts | une météorologue toujours fâchée contre le ciel | Ses prévisions sont toujours fausses, sauf quand il pleut |
| 7 | **Île Moitié** (anciennement Île Entière) | bout de plage qui raccourcit à chaque visite | marée montante | le maire, qui refuse de renommer l'île | Panneau « Bienvenue sur l'Île ~~Entière~~ Moitié » |
| 8 | **Île du Bureau de Poste** | cour de la poste | vent de face | la postière, qui ferme à 17 h pile | « Il est 17 h 00 et 3 secondes. C'est fermé. » |

**Progression :** une île ouvre l'île suivante. Les colis montent en exigence d'une île à l'autre, et chaque île apporte au plus une nouveauté (règle de `DIFFICULTY_BALANCING.md` conservée). Les commandes **se rejouent** : chaque île garde un tableau de commandes, avec une meilleure note client à battre.

**Le PLOUF devient un moment fort :** le colis flotte, Pip sort de l'eau avec une phrase (« Le colis est imperméable. Moi, non. »), et le client laisse un avis en direct : « ★☆☆☆☆ Reçu mouillé. Le dauphin a signé à ma place. »

## 7. Direction artistique (D8 réinterprétée par D17)

- **Affiche de voyage vintage tropicale, détournée** : ciels orange et turquoise, grands aplats, typographie rétro, mais avec des détails grinçants (palmier sous perfusion, panneau « Plage — bientôt ici »).
- **Avions bricolés avec des objets de plage** : flotteurs en bouées-canards (décor seulement, D19), aile en planche de surf, hélice en ventilateur, réservoir en glacière.
- **Pip** : bob, gilet fluo de LivrÎle, sacoche, toujours sans genre marqué.
- **Réaliste pour zéro budget** : formes simples, palette restreinte (6–8 couleurs), mer en aplats avec des vagues en traits. Pas d'animation de personnage complexe : Pip garde ses calques et expressions actuels.

## 8. Ton : grinçant, tout public (D20)

**Oui** : satire de la livraison express (statut de « partenaire indépendant », délais absurdes, notes clients), clients ridicules, tourisme, îles qui rétrécissent (dit avec légèreté, jamais en leçon de morale), colis absurdes.

**Non, jamais** : sang, mort explicite, blessure ; moquerie d'un groupe réel ; marque réelle (la société s'appelle **LivrÎle**, nom inventé) ; humour qui exige de savoir lire longtemps : chaque blague tient en **une ligne**, avec des icônes, pour les plus jeunes.

## 9. Risques

| # | Risque | Parade |
|---|---|---|
| P1 | **Trop de lecture** pour les plus jeunes (commandes, avis) | Commande = icône du colis + 3 pictos de contraintes + 1 ligne drôle ; texte toujours facultatif pour réussir |
| P2 | **Atterrissages trop durs** (zones plus petites + colis fragiles) | Courbe : île 0 sans contrainte ; fragilité ajoutée progressivement ; le pilote robot vérifie en CI que chaque commande est réussissable avec au moins une configuration |
| P3 | Le joueur **n'adapte pas l'avion** et force avec le même | Les commandes sont conçues pour qu'une configuration inadaptée échoue de façon **visible et drôle** (« trop lourd pour décoller : le frigo reste sur la piste ») |
| P4 | **Humour qui tombe à plat** ou qui ne se traduit pas (FR/EN) | Valider 10 exemples maintenant (§11) ; éviter les jeux de mots intraduisibles dans les textes indispensables |
| P5 | Sujet « livraison » **déjà vu** sur Poki | Notre différence est la combinaison « avion bricolé + atterrissage noté + note client » ; à vérifier par une recherche de concurrents avant la Phase 5 |
| P6 | Sujet sensible : montée des eaux | Une seule blague récurrente (Île Moitié), légère, jamais culpabilisante |
| P7 | **Dérive de périmètre** (largage, amerrissage…) | D18 et D19 : non au MVP ; idées notées pour plus tard |

## 10. Impact sur Poki et sur les pubs

- **Rétention** : une commande = une session courte avec un objectif clair, très adaptée au jeu sur portail. Le tableau de commandes rejouables avec note à battre donne une raison de revenir.
- **Miniature** : Pip trempé, un colis qui flotte à côté, avion bricolé en arrière-plan. Lisible en 200 × 200 px.
- **Pub entre deux parties (`commercialBreak`)** : au clic sur **« Livraison suivante »**, jamais pendant un vol (D10 inchangée).
- **Pubs récompensées (`rewardedBreak`)**, toujours facultatives :
  - ✅ **« Pourboire ×2 »** sur l'écran de note client (remplace « ×2 gains ») ;
  - ✅ **« Louer cette pièce pour une livraison »** au hangar (remplace « essayer une pièce » ; s'inscrit naturellement dans la satire) ;
  - ❌ « Réexpédier le colis perdu sans recommencer » : rejeté, c'est une seconde chance qui crée de la frustration artificielle (règle D10) ;
  - ❌ « Assurance colis payante » : rejeté pour la même raison. On peut en revanche en faire une **blague** (« Assurance : non incluse »).

## 11. Dix exemples de commandes et de blagues (pour valider le ton)

| # | Île | Colis et contrainte | Message de commande | Avis client selon le résultat |
|---|---|---|---|---|
| 1 | Dépôt (tuto) | 📦 Carton « NE PAS SECOUER » (aucune contrainte) | « Livraison test. Si tu le casses, on fera semblant que c'était un test. » | ★★★★★ « Parfait. Personne n'a jamais su ce qu'il y avait dedans. » |
| 2 | Cocotte | 🥚 Douze œufs, **fragile** (PARFAIT exigé) | « Mes poules sont en grève. Je fais venir des œufs par avion. Ne me jugez pas. » | ★☆☆☆☆ « J'ai commandé des œufs, j'ai reçu une omelette. » |
| 3 | Cocotte | 🐔 Trois poules, **le centre de gravité bouge** | « Elles s'appellent Lundi, Mardi et Pas-Toucher. » | ★★★★☆ « Les poules vont bien. Elles ne veulent plus jamais en parler. » |
| 4 | Phare Penché | 💡 Ampoule géante, **fragile + piste en pente** | « Le phare ne s'allume plus. Les bateaux se garent au pif. » | ★★☆☆☆ « Ampoule reçue cassée. Mais elle brille d'une autre façon. » |
| 5 | Îlot Ponton | 🛶 Canoë, **sur le toit (traînée)** | « J'ai un canoë. J'ai besoin d'un deuxième canoë. C'est comme ça. » | ★★★★★ « Il est arrivé en un seul morceau. Le ponton, un peu moins. » |
| 6 | Île Transat | 🍦 Glace triple boule, **fond en 60 s** | « Le bar n'a plus de glace. Les touristes deviennent bizarres. » | ★☆☆☆☆ « J'ai reçu un milkshake. Je n'avais pas commandé de milkshake. » |
| 7 | Île Transat | 📶 Routeur Wi-Fi, **urgent** | « Ça fait 12 minutes qu'on n'a pas posté de photo. C'est grave. » | ★★★★★ « Livré à temps. Nous avons pu prendre une photo du routeur. » |
| 8 | Île Orageuse | 🧊 Frigo, **lourd + piste longue exigée** | « Mon frigo est tombé en panne pendant la canicule. Mon beurre est devenu une soupe. » | ★★★☆☆ « Le frigo est arrivé. Il fait un drôle de bruit. Le livreur aussi. » |
| 9 | Île Moitié | 🏖️ Panneau « PLAGE », **volumineux** | « Pour remplacer l'ancien. L'ancien est sous l'eau. Avec l'ancienne plage. » | ★★★★☆ « Joli panneau. On le plantera dès qu'on retrouve la plage. » |
| 10 | Bureau de Poste | ✉️ Lettre recommandée, **avant 17 h (chrono)** | « Il est 16 h 58. Pas de pression. » | ☆☆☆☆☆ « Arrivé à 17 h 00 et 3 secondes. Refusé. La règle, c'est la règle. » |

**Phrases de Pip (exemples)** :
- au décollage : « Statut : partenaire indépendant. Casque : en option. » ;
- en PLOUF : « Le colis est imperméable. Moi, non. » ;
- en PARFAIT : « Livré. Tu peux mettre 5 étoiles ? Sinon je dors dans l'avion. » ;
- colis trop lourd : « Il pèse combien, ce frigo ? … Ah. Plus que l'avion. »

**Message de la société LivrÎle** (écran de chargement) : « LivrÎle — Livré en 30 minutes ou presque. *Presque : de 30 minutes à jamais.* »

---

## 12. Prochaine étape : v0.6 « Première livraison » (en attente de feu vert)

- **2 îles** : Île du Dépôt (tutoriel) et Île Cocotte.
- **3 colis** : carton test (aucune contrainte), œufs (fragile), poules (centre de gravité qui bouge).
- **3 configurations d'avion** : L'Albatros, Le Coucou et La Fusée réutilisés. Leurs barres changent quand le colis est chargé.
- **Écran de commande** (colis, contraintes en pictos, message drôle) et **écran « Note client »** (étoiles, avis, état du colis, paiement, pourboire).
- **Tests** : chaque commande est réussissable avec au moins une configuration ; la fragilité, le centre de gravité qui bouge et l'état du colis sont vérifiés. Poids ≤ 4 Mo.
