# ✈️ CAN YOU FLY? *(nom de code)*

> **Pip, « partenaire indépendant » de la société LivrÎle, livre des colis absurdes aux habitants d'un archipel tropical. Chaque colis oblige à adapter l'avion… puis à réussir l'atterrissage.**
>
> *Pivot du 14/11/2026 : voir [`docs/PIVOT_LIVREUR_TROPICAL.md`](docs/PIVOT_LIVREUR_TROPICAL.md). La version jouable en ligne (v0.5) est encore l'ancienne étape Paris → Reims.*
> Jeu d'arcade 2D cartoon en HTML5, destiné à la plateforme [Poki](https://poki.com).

**État actuel : v0.5 jouable sur https://thomas-byte-cmyk.github.io/CanYouFly/ — pivot validé, prochaine étape : v0.6 « Première livraison ».**
👉 Commencez par lire le **[Dossier de conception](docs/DESIGN_DOSSIER.md)**, puis **[PROJECT_STATUS.md](PROJECT_STATUS.md)**.

## Le jeu en 30 secondes

```
BUILD → FLY → LAND OR CRASH → REWARD → UNLOCK → DISCOVER → BUILD AGAIN
```

1. **Construire** un avion à partir de pièces qui ont chacune un avantage et un défaut.
2. **Piloter** activement (tangage + gaz) d'une ville à la suivante.
3. **Atterrir** : choisir sa zone, gérer vitesse et angle — PERFECT, GOOD, ROUGH, CRASH… ou WATER CRASH.
4. **Gagner des Boulons** 🔩 même en cas d'échec, débloquer pièces, villes et cosmétiques pour **Pip**, le pilote.

## Organisation du dépôt

| Fichier | Contenu |
|---|---|
| [`PROJECT_STATUS.md`](PROJECT_STATUS.md) | Ce qui est fait, en cours, bloqué, à venir |
| [`ROADMAP.md`](ROADMAP.md) | Les 5 phases et leurs jalons |
| [`DECISIONS.md`](DECISIONS.md) | Historique des décisions validées |
| [`CHANGELOG.md`](CHANGELOG.md) | Historique des évolutions |
| [`docs/DESIGN_DOSSIER.md`](docs/DESIGN_DOSSIER.md) | **Synthèse de la conception** — à lire en premier |
| [`docs/PROJECT_WORKFLOW.md`](docs/PROJECT_WORKFLOW.md) | Branches, labels, milestones, définition de « terminé » |

### Documents de conception (`docs/`)

| Domaine | Documents |
|---|---|
| Game design | [GAME_DESIGN](docs/GAME_DESIGN.md) · [WORLD_MAP](docs/WORLD_MAP.md) · [LANDING_AND_CRASH_SYSTEM](docs/LANDING_AND_CRASH_SYSTEM.md) |
| Technique | [TECHNICAL_ARCHITECTURE](docs/TECHNICAL_ARCHITECTURE.md) · [PHYSICS_AND_CONTROLS](docs/PHYSICS_AND_CONTROLS.md) |
| Direction artistique | [ART_DIRECTION](docs/ART_DIRECTION.md) · [PILOT_CHARACTER](docs/PILOT_CHARACTER.md) · [CUSTOMIZATION_SYSTEM](docs/CUSTOMIZATION_SYSTEM.md) · [AUDIO_DESIGN](docs/AUDIO_DESIGN.md) |
| Économie | [PROGRESSION_SYSTEM](docs/PROGRESSION_SYSTEM.md) · [DIFFICULTY_BALANCING](docs/DIFFICULTY_BALANCING.md) · [MONETIZATION_STRATEGY](docs/MONETIZATION_STRATEGY.md) |
| Marché & Poki | [MARKETING_STRATEGY](docs/MARKETING_STRATEGY.md) · [POKI_COMPLIANCE](docs/POKI_COMPLIANCE.md) |

## Stack technique prévue (après validation)

Phaser 3 · TypeScript · Vite · physique de vol maison · sauvegarde locale robuste · SDK Poki · tests sur GitHub Pages.

## Méthode

Projet piloté par un chef de projet IA (Claude Code) et quatre agents spécialisés (Développement, Game Design & DA, Marketing, Économie), sous la validation du porteur du projet. Tâches suivies dans les [issues](../../issues).

## Lancer le jeu en local (développeurs)

Prérequis : [Node.js](https://nodejs.org) 22 ou plus récent.

```bash
npm install        # installe Phaser, TypeScript, Vite, Vitest
npm run dev        # lance le jeu sur http://localhost:5173
npm test           # tests automatiques (physique, atterrissage, récompenses)
npm run build      # version de production dans dist/
```

Outils de réglage (sans affichage) : `npx vite-node scripts/simulate.ts` et `npx vite-node scripts/landing-check.ts`.

Toutes les valeurs de jeu sont dans `src/data/` (avion, physique, surfaces, seuils d'atterrissage, étape) et se modifient sans toucher au code.
