# Changelog

Format inspiré de [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/).

## [Non publié]

## [0.6.0] — 14/11/2026 — « Première livraison » (pivot D17)
- **Boucle livreur** : écran de commande (colis, contraintes en pictos, message du client) → adapter l'avion au colis → vol → livraison en atterrissant → écran « Note client » (1–5 ★, avis, état du colis, paiement, pourboire, phrase de Pip) → commande suivante.
- **2 îles** : Île du Dépôt (tutoriel, piste en terre) et Île Cocotte (plage courte + pré aux poules, îlot de secours, alizé, oiseaux) ; décor tropical (sable, palmiers, cases, archipel à l'horizon).
- **3 colis** (`src/data/packages/`) : carton (aucune contrainte), œufs (fragiles : tolérance ×0,5), poules (masse qui bouge en vol : le centre de gravité oscille).
- **Le colis modifie l'avion** (`src/sim/cargo.ts`) : masse, centre de gravité, traînée, fragilité ; les barres des 3 avions sont recalculées avec le colis à bord. Le colis est visible dans l'avion (les poules gigotent).
- **Livraison** (`src/sim/delivery.ts`, D18) : livré intact / cabossé (−30 %) / en miettes (−70 %), perdu en mer (échec + consolation), refusé hors zone.
- **PLOUF** : le colis flotte, Pip : « Le colis est imperméable. Moi, non. »
- 13 nouveaux tests (52) : chaque commande livrable intacte avec au moins un avion ; pour les œufs, l'Albatros fait mieux que la Fusée. Outil `scripts/delivery-check.ts`.

### 14/11/2026 — Pivot « livreur de colis aux îles » (étape A, sans code)
- Nouveau document `docs/PIVOT_LIVREUR_TROPICAL.md` : vision, ce qu'on garde, ce qu'on jette, réutilisation du code, colis et contraintes, 9 îles, direction artistique, ton, risques, impact Poki et pubs, 10 exemples de commandes.
- Décisions D17 à D20 ; D6 remplacée, D5 adaptée, D8 réinterprétée, D7 et D12 maintenues.
- Roadmap réorganisée (v0.6 « Première livraison », go / no-go, hangar).
- Bilan du projet au 14/11/2026 (`docs/BILAN_2026-11-14.md`).

## [0.5.0] — 14/11/2026 — L'avion compte
Retours : « on ne peut pas descendre plus vite », « le gaz ne sert à rien », « fabriquer l'avion doit avoir un impact ».
- **Piquer** : doigt à gauche de l'écran (ou ↓) ; doigt à droite = monter ; rien = descente douce.
- La jauge des gaz (inutile en mode un doigt) devient la **jauge de carburant** (rouge et clignotante sous 25 %).
- **Caractère de vol calculé à partir des pièces** (`src/sim/handling.ts`) : angle de montée (moteur, poids, traînée), angle de descente (finesse), vitesses de décrochage / d'approche / de croisière / max, vivacité en tangage, autonomie. Utilisé par la commande à un doigt, les gaz automatiques et les volets.
- **3 avions au choix** (avant-goût du hangar) : L'Albatros (facile : plane loin, se pose doucement), Le Coucou (moyen), La Fusée (difficile : monte fort, atterrit vite, boit beaucoup). Écran « Choisis ton avion » avec 6 barres calculées, accessible depuis les résultats (bouton « Changer d'avion » ou touche C).
- 5 nouveaux tests (39) : aucun avion ne domine les autres sur toutes les barres, et chaque avion peut réussir l'étape.

## [0.4.0] — 14/11/2026 — Commande à un doigt
Retour : « les commandes sont encore trop dures, mon fils (12 ans et +) a essayé, pas assez intuitif ».
- **Nouvelle commande par défaut (décision D16)** : tout l'écran est un bouton. Appuyer (doigt, clic, Espace ou ↑) = monter ; relâcher = redescendre doucement ; près du sol, arrondi automatique. ↓ (clavier) = plonger, en option.
- Gaz entièrement automatiques ; aérofreins automatiques en approche (l'avion ne « flotte » plus et ne sort plus de la zone).
- En approche, la trajectoire prévue montre ce qui se passe **si tu relâches maintenant**.
- L'ancien manche + gaz reste disponible avec `?controls=stick` à la fin de l'adresse.
- 4 nouveaux tests (34 au total) ; outil `scripts/onebutton-check.ts`. Vérifié dans le navigateur : PERFECT sur la piste de Reims avec la seule touche Espace.

## [0.3.0] — 13/11/2026 — Pilotage arcade
Retour : « je n'arrive toujours pas à atterrir, il y a trop d'inertie quand on va en haut et en bas ».
- Mesure : en mode simulation, 0,5 s d'appui ne levait le nez que de ~3°, avec un retard de près d'1 s.
- **Pilotage arcade par défaut** : la commande règle directement la vitesse de rotation du nez (42°/s), réponse en 0,08 s, arrêt net au relâchement ; la trajectoire suit le nez en ~0,3 s.
- La stabilité de la construction reste perceptible (un avion lourd de l'arrière cabre toujours tout seul).
- 4 nouveaux tests (30 au total) ; outil `scripts/pitch-check.ts` pour mesurer la réponse en tangage.

## [0.2.0] — 13/11/2026 — Retours du premier test
Retours : « vol un peu ennuyeux », « impossible d'atterrir correctement » (crash au contact, on ne voit pas où viser).
### Atterrissage
- Effet de sol : coussin d'air près du sol qui adoucit la fin de descente.
- Seuils plus tolérants (train : 7 u/s ; nez jusqu'à −4° accepté) ; freinage plus fort après le contact ; lampadaire éloigné de la piste.
- Ombre de l'avion au sol pour juger la hauteur.
- Point d'impact prévu avec le résultat annoncé (PARFAIT / BON / BRUTAL / CRASH / PLOUF).
- Liste des zones devant l'avion avec la distance ; rappel « RELÈVE LE NEZ ! » près du sol.
### Croisière
- 3 séries d'anneaux (bonus de série +10), anneau boost vert.
- 21 Boulons à ramasser en vol.
- Vent arrière, zone de rafales, deuxième ascendance.
- Obstacles vivants : montgolfière (rebond « boing ») et deux vols d'oiseaux (ralentissement, plumes), sans crash.
### Tests
- 26 tests ; un pilote robot obtient PERFECT/GOOD sur la piste et le champ, même sans arrondi si la descente est calme.

## [0.1.0] — 13/11/2026 — Jalon « Sensation de vol »
### Ajouté
- Simulateur de vol maison (pas fixe 60 Hz) : portance avec décrochage, traînée, poussée d'hélice, centre de gravité et marge statique, trim automatique, plafond doux, ascendances.
- Volets automatiques en approche (l'avion ralentit pour pouvoir se poser).
- Atterrissage noté PERFECT / GOOD / ROUGH / CRASH / WATER CRASH, collisions avec les obstacles, nez en premier, étoiles et validation d'étape (décision D5).
- Étape Paris → Reims : piste, champ de secours, la Marne, grand champ (★), piste de Reims (★★), parc de la cathédrale (★★★).
- Pilote Pip dans le cockpit avec expressions et états après atterrissage (suie, casque de travers, trempé).
- Interface : progression du trajet, jauges, gaz auto/manuels, indicateur de descente en approche, trajectoire prévue, pause.
- Commandes clavier (↑↓, ←→, T, Maj, Échap, R, G) et tactiles (manche relatif + curseur de gaz ; variante `?touch=buttons`).
- Écran de résultats : récit du trajet, phrases humoristiques, statistiques, Boulons, conseil ciblé, bouton Revoler.
- 22 tests automatiques, CI GitHub Actions (tests, build, budget de poids ≤ 4 Mo), déploiement GitHub Pages.

### 13/11/2026 — Validation de la conception
- Les 15 décisions de conception sont validées (D9 modifiée : zéro budget pour l'instant).
- Documents harmonisés : itinéraire en 8 étapes (progression, équilibrage, game design), flotteurs reportés après le MVP, budget art/audio, pilote Pip.

### 13/11/2026 — Phase 1 : conception
- Ajout du dossier de conception (synthèse et arbitrages).
- Ajout de 15 documents de domaine (game design, technique, DA, son, économie, marketing, conformité Poki).
- Ajout de l'organisation du projet : README, statut, roadmap, décisions, workflow, modèles d'issues et de PR, `.gitignore`.
- Création de 18 issues (#1–#18) et des labels domaine / priorité / type / phase / statut.
