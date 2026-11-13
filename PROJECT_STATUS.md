# État du projet

_Dernière mise à jour : 13/11/2026_

## Phase actuelle : 🟢 Phase 2 — Jalon « Sensation de vol » livré, **en attente de vos retours de jeu**

| Phase | Statut |
|---|---|
| 1 — Conception et organisation | ✅ Validée le 13/11/2026 |
| 2a — Sensation de vol | 🟢 v0.2 (13/11/2026) après le 1er test — à retester (issue #8) |
| 2b — Prototype complet | ⚪ Après vos retours |
| 3 — MVP complet | ⚪ |
| 4 — Polish | ⚪ |
| 5 — Publication Poki | ⚪ |

## ✅ Terminé
- **v0.2** : atterrissage plus juste (effet de sol, ombre, impact prévu, zones), croisière enrichie (anneaux, boosts, Boulons, vent, oiseaux, montgolfière)
- **Jalon « Sensation de vol » (v0.1)** : physique de vol maison, commandes clavier + tactile, étape Paris → Reims, atterrissage noté (5 résultats), écran de résultats, 22 tests automatiques, CI, déploiement GitHub Pages (issues #4 à #7)
- **Validation des 15 décisions de conception** (issue #1) → `DECISIONS.md`
- Harmonisation des documents avec les décisions (issue #2)
- Analyse du cahier des charges, critique et arbitrages → [`docs/DESIGN_DOSSIER.md`](docs/DESIGN_DOSSIER.md)
- 15 documents de conception produits par les 4 agents (voir README)
- Structure du dépôt, modèles d'issues/PR, workflow Git → [`docs/PROJECT_WORKFLOW.md`](docs/PROJECT_WORKFLOW.md)
- Roadmap, registre des décisions, changelog
- 18 issues de suivi (phases 1, 2 et epic MVP), labels créés → [issues](../../issues)

## 🔄 En cours
- Point de validation « Sensation de vol » (issue #8) : vous jouez, on ajuste.

## ⛔ Bloqué / nécessite une intervention humaine
| Blocage | Pourquoi | Action requise |
|---|---|---|
| **Milestones et GitHub Project non créés** | Les outils GitHub de l'IA ne permettent pas de créer des milestones ni des Projects | Option : les créer à la main (5 min, voir ci-dessous) ; sinon les labels `phase:*` les remplacent |
| **Pages officielles Poki non lues en entier** | Le réseau de l'environnement de l'IA bloque `poki.com` | Relecture humaine des 3 pages de référence avant la Phase 3 (issue #3) |
| **Accès Poki for Developers** | Plateforme en bêta fermée | Candidater quand le prototype sera jouable (issue #17) |
| **Branche par défaut** | Elle pointe encore sur la branche de session | Settings → General → Default branch → `main` |

### Activer GitHub Pages (2 minutes, une seule fois)
1. Ouvrir le dépôt sur GitHub → onglet **Settings** (en haut à droite).
2. Menu de gauche → **Pages**.
3. Rubrique **Build and deployment** → **Source** : choisir **GitHub Actions**.
4. Onglet **Actions** → workflow **Déploiement GitHub Pages** → bouton **Run workflow** (branche `main`).
5. Le jeu est ensuite en ligne à l'adresse https://thomas-byte-cmyk.github.io/CanYouFly/ (mise à jour automatique à chaque fusion dans `main`).

### Créer les milestones à la main (optionnel)
1. Ouvrir le dépôt sur GitHub → onglet **Issues** → bouton **Milestones** → **New milestone**.
2. Créer : `M1 — Conception validée`, `M2 — Prototype jouable`, `M3 — MVP complet`, `M4 — Polish`, `M5 — Soumission Poki`.
3. Me le signaler : je rattacherai les issues existantes.

## ⏭️ À venir
1. Vos retours sur le vol et l'atterrissage → réglages (fichiers `src/data/*.json`).
2. Prototype complet (2b) : hangar à emplacements, ~24 pièces, Pip personnalisable, dégâts visibles, sons, 2e étape.

## Limites connues de la v0.1
- Graphismes en formes simples (placeholders), pas de son.
- Écrans très allongés (téléphones récents) : bandes sur les côtés.
- Pas encore de sauvegarde : les Boulons sont perdus en rechargeant la page.
- Le parc ★★★ est volontairement très difficile ; à confirmer en jeu.
