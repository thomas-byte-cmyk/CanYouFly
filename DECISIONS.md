# Registre des décisions

Statuts : ✅ validée · 🟡 proposée, en attente · ❌ rejetée. Les décisions ne sont **jamais supprimées** : une décision remplacée est marquée comme telle.

## Décisions validées

| # | Date | Décision | Par |
|---|---|---|---|
| D0 | 13/11/2026 | Le dépôt reste **public** (pour tester le jeu via GitHub Pages). Conséquence : aucun secret dans le dépôt, documents de conception publics. | Porteur du projet |
| O1 | 13/11/2026 | Organisation Git : `main` + `feature/*` / `fix/*` / `release/*`, pas de `develop`, Conventional Commits, labels domaine/priorité/type/phase. | Chef de projet (décision organisationnelle) |
| O2 | 13/11/2026 | Documentation en français, dans `docs/` ; fichiers de pilotage à la racine. | Chef de projet |

## Décisions de conception validées le 13/11/2026 (fin de Phase 1)

Argumentation : [`docs/DESIGN_DOSSIER.md`](docs/DESIGN_DOSSIER.md). Décisions prises par le porteur du projet, question par question.

| # | Décision | Statut |
|---|---|---|
| D1 | Construction à emplacements (slots) : fuselage + 10 emplacements, aile principale en 3 positions | ✅ |
| D2 | Premier vol sans construction (avion « Le Coucou »), hangar ouvert après le 1er atterrissage | ✅ |
| D3 | Tangage + gaz manuels (gaz auto pendant le tutoriel), paysage uniquement sur mobile | ✅ → remplacée par D16 pour la commande (paysage conservé) |
| D4 | Pas d'upgrades de stats : progression = nouvelles pièces différentes, villes, cosmétiques | ✅ |
| D5 | Étape validée = arrêt dans la zone d'arrivée hors eau, même en crash ; qualité = étoiles (1–3) + Boulons | ✅ (sans préférence exprimée → recommandation retenue, révisable après playtests) |
| D6 | 8 étapes : Paris → Reims (tuto) → Bruxelles → Amsterdam → Londres → Berlin → Rome → Athènes → Istanbul | ✅ |
| D7 | Flotteurs reportés après le MVP ; seules quelques zones de secours balisées sur l'eau | ✅ |
| D8 | Direction artistique « Atelier du Dimanche » ; pilote « Pip », genre non marqué | ✅ |
| D9 | **Zéro budget pour l'instant** (packs libres, production maison, IA pour le concept art). Investissement freelance seulement si le jeu reçoit de bons retours | ✅ (modifiée par rapport aux options proposées) |
| D10 | Monnaie unique « Boulons » ; interstitiel au clic « Revoler » (jamais en vol, pas au 1er vol) ; 2 rewarded facultatives : ×2 gains, essai de pièce | ✅ |
| D11 | Durée cible du MVP : 1 h 30 – 2 h 30 sans pub | ✅ |
| D12 | Cible 8–16 ans + famille, mobile prioritaire, FR + EN au lancement | ✅ |
| D13 | « CAN YOU FLY? » = nom de code ; nom final choisi en Phase 4 | ✅ |
| D14 | Jalon « Sensation de vol » avant le prototype complet | ✅ |
| D15 | Candidature Poki for Developers dès le prototype jouable ; exclusivité web Poki acceptée | ✅ |
| D16 | *(14/11/2026, après 3 tests)* **Commande à un doigt** par défaut : appuyer = monter, relâcher = descendre doucement, arrondi et gaz automatiques. Remplace D3 (tangage + gaz manuels), qui reste disponible en option | ✅ |

## Décisions techniques prises par le chef de projet (révisables)

| # | Décision | Raison |
|---|---|---|
| T1 | Phaser 3 + TypeScript + Vite | Léger, mature, plugin Poki, bon sur mobile |
| T2 | Physique de vol maison, pas de Matter.js | Un seul corps, contrôle du feeling, testable |
| T3 | Données de jeu en JSON éditables | Équilibrage sans toucher au code |
| T4 | Chargement initial ≤ 4 Mo (Poki : < 8 Mo) | Rétention au chargement |
| T5 | `gameplayStart` au hangar et en vol, `gameplayStop` sur résultats/menus/pause | Hangar = jeu actif |
| T6 | Phaser **3.90** (dernière version 3) plutôt que Phaser 4 | Fidèle à T1, plugin Poki prévu pour Phaser 3 ; migration possible plus tard |
| T7 | **Volets automatiques** à l'entrée de l'approche (vitesse ~28 u/s au lieu de 42) | Sans eux, l'avion arrivait trop vite pour se poser (vérifié par simulation). Aide arcade, révisable après vos tests |
| T9 | **Pilotage arcade** par défaut (rotation du nez commandée directement, trajectoire qui suit le nez) ; le modèle « simulation » reste disponible dans le code | Retour de test : trop d'inertie, atterrissage impossible. Révisable |
| T10 | Le **caractère de vol** (montée, descente, vitesses, vivacité, autonomie) est **calculé à partir des pièces**, jamais réglé à la main par avion | Garantit que le hangar aura un impact réel (retour de test v0.4) |
| T11 | Mode un doigt : moitié droite = monter, moitié gauche = piquer | Retour : impossible de descendre vite |
| T8 | Simulation en temps réel même si l'appareil est lent (pas de lissage du delta Phaser) | Sinon le jeu passe au ralenti sur les petits téléphones |
