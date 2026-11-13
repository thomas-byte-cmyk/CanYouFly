# Organisation du projet et workflow GitHub

> Document de pilotage. Décrit **comment** on travaille, pas **quoi** on construit.

## 1. Principe

GitHub est la source unique de vérité :

| Besoin | Où le trouver |
|---|---|
| Où en est le projet ? | `PROJECT_STATUS.md` |
| Qu'est-ce qui arrive ensuite ? | `ROADMAP.md` + issues ouvertes |
| Pourquoi a-t-on choisi X ? | `DECISIONS.md` |
| Qu'est-ce qui a changé ? | `CHANGELOG.md` + historique Git |
| Comment fonctionne le jeu ? | `docs/*.md` |

## 2. Branches

Projet petit (1 humain + des agents IA) : on garde un modèle **léger**.

| Branche | Rôle | Règle |
|---|---|---|
| `main` | Version stable, toujours jouable à partir de la Phase 2 | On n'y pousse que par Pull Request |
| `feature/<sujet>` | Une fonctionnalité (ex. `feature/builder-slots`) | Courte durée, une issue = une branche |
| `fix/<sujet>` | Correction de bug | Idem |
| `release/<version>` | Préparation d'une soumission Poki (Phase 5 seulement) | Gel des fonctionnalités |
| `docs/<sujet>` ou branche de session | Documentation | Fusionnée via PR |

**Pas de branche `develop`** : avec un seul flux de travail elle doublerait `main` sans bénéfice. On la créera seulement si plusieurs fonctionnalités doivent être intégrées ensemble avant d'être stables.

> Note technique : l'environnement de travail de l'IA impose une branche de session (`ccr-…`). Les livrables de chaque session y sont poussés puis fusionnés dans `main` via Pull Request.

## 3. Commits

Format **Conventional Commits** (lisible et utilisable pour générer le changelog) :

```
docs: ajoute le système d'atterrissage
feat(builder): snap des pièces sur les slots
fix(physics): le centre de gravité ignorait le réservoir
chore: configuration CI
```

## 4. Issues

Chaque issue contient : objectif, résultat attendu, critères d'acceptation, dépendances, priorité, domaine (modèle dans `.github/ISSUE_TEMPLATE/task.md`).

### Labels

| Famille | Labels |
|---|---|
| Domaine (agent) | `agent:dev`, `agent:design`, `agent:marketing`, `agent:economy`, `agent:pm` |
| Priorité | `P0` (bloquant / indispensable), `P1` (important), `P2` (secondaire / reportable) |
| Type | `type:design`, `type:feature`, `type:bug`, `type:research`, `type:decision` |
| Phase | `phase:1-conception`, `phase:2-prototype`, `phase:3-mvp`, `phase:4-polish`, `phase:5-release` |
| Statut | `status:blocked`, `status:needs-validation` |

### Milestones

1. **M1 — Conception validée**
2. **M2 — Prototype jouable** (BUILD → FLY → LAND OR CRASH)
3. **M3 — MVP complet** (7 villes, progression, SDK Poki)
4. **M4 — Polish**
5. **M5 — Soumission Poki**

> Si les milestones ou le GitHub Project ne peuvent pas être créés automatiquement (limite des outils disponibles), les labels `phase:*` jouent le même rôle. Voir `PROJECT_STATUS.md` → Blocages.

## 5. Définition de « terminé »

Une fonctionnalité n'est **terminée** que si :
1. elle est fusionnée dans `main` ;
2. elle a été **testée** (tests automatiques quand c'est pertinent + test manuel desktop et mobile) ;
3. la documentation concernée est à jour ;
4. l'issue est fermée avec un commentaire indiquant comment elle a été vérifiée.

## 6. Points de validation avec le porteur du projet

| Moment | Ce qui est validé |
|---|---|
| Fin Phase 1 | Concept, périmètre du prototype, grands arbitrages |
| Mi-Phase 2 | Sensation de vol (vidéo / build jouable) |
| Fin Phase 2 | « Est-ce fun ? » — go / no-go pour le MVP |
| Fin Phase 3 | Contenu et économie |
| Avant soumission | Build final, miniature, description |

## 7. Sécurité

- Aucun token, mot de passe ou clé dans le dépôt (`.gitignore` couvre `.env*`, `*.key`, `*.pem`).
- Secrets éventuels : **GitHub → Settings → Secrets and variables → Actions**.
- Aucune action destructive (suppression de branche importante, réécriture d'historique de `main`, changement de visibilité) sans prévenir le porteur du projet.
