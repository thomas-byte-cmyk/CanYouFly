# Registre des décisions

Statuts : ✅ validée · 🟡 proposée, en attente · ❌ rejetée. Les décisions ne sont **jamais supprimées** : une décision remplacée est marquée comme telle.

## Décisions validées

| # | Date | Décision | Par |
|---|---|---|---|
| D0 | 13/11/2026 | Le dépôt reste **public** (pour tester le jeu via GitHub Pages). Conséquence : aucun secret dans le dépôt, documents de conception publics. | Porteur du projet |
| O1 | 13/11/2026 | Organisation Git : `main` + `feature/*` / `fix/*` / `release/*`, pas de `develop`, Conventional Commits, labels domaine/priorité/type/phase. | Chef de projet (décision organisationnelle) |
| O2 | 13/11/2026 | Documentation en français, dans `docs/` ; fichiers de pilotage à la racine. | Chef de projet |

## Décisions proposées — en attente de validation

Détail et argumentation : [`docs/DESIGN_DOSSIER.md`](docs/DESIGN_DOSSIER.md) §17.

| # | Décision proposée | Recommandation |
|---|---|---|
| D1 | Construction à emplacements (slots) | Oui |
| D2 | Premier vol sans construction (avion « Le Coucou ») | Oui |
| D3 | Tangage + gaz manuels (gaz auto au début), paysage uniquement | Oui |
| D4 | Pas d'upgrades de stats | Oui |
| D5 | Étape validée = arrêt dans la zone d'arrivée hors eau ; qualité = étoiles + Boulons | Oui |
| D6 | 8 étapes : Paris → Reims → Bruxelles → Amsterdam → Londres → Berlin → Rome → Athènes → Istanbul | Oui |
| D7 | Flotteurs / amerrissage après le MVP | Oui |
| D8 | Direction artistique A « Atelier du Dimanche », pilote « Pip » | Oui |
| D9 | Budget graphismes / musique freelance | À décider |
| D10 | Monnaie « Boulons » ; interstitiel au clic « Revoler » ; rewarded ×2 gains et essai de pièce | Oui |
| D11 | Durée MVP 1 h 30 – 2 h 30 sans pub | Oui |
| D12 | Cible 8–16 ans + famille, mobile prioritaire, FR + EN | Oui |
| D13 | « CAN YOU FLY? » = nom de code, nom final en Phase 4 | Oui |
| D14 | Jalon « Sensation de vol » avant le prototype complet | Oui |
| D15 | Candidater à Poki for Developers dès le prototype, accepter l'exclusivité web | Oui |

## Décisions techniques prises par le chef de projet (révisables)

| # | Décision | Raison |
|---|---|---|
| T1 | Phaser 3 + TypeScript + Vite | Léger, mature, plugin Poki, bon sur mobile |
| T2 | Physique de vol maison, pas de Matter.js | Un seul corps, contrôle du feeling, testable |
| T3 | Données de jeu en JSON éditables | Équilibrage sans toucher au code |
| T4 | Chargement initial ≤ 4 Mo (Poki : < 8 Mo) | Rétention au chargement |
| T5 | `gameplayStart` au hangar et en vol, `gameplayStop` sur résultats/menus/pause | Hangar = jeu actif |
