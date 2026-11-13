# Changelog

Format inspiré de [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/).

## [Non publié]

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
