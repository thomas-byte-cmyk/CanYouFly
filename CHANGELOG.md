# Changelog

Format inspiré de [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/).

## [Non publié]

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
