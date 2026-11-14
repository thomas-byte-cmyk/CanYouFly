# Roadmap

> **Pivot du 14/11/2026 (D17)** : le jeu devient « Pip, livreur de colis aux îles ». Voir [`docs/PIVOT_LIVREUR_TROPICAL.md`](docs/PIVOT_LIVREUR_TROPICAL.md).
> Estimations en jours-homme de développement assisté par IA, hors graphismes définitifs.

## M1 — Conception validée ✅ *(13/11/2026)*
- Dossier de conception, documents de domaine, organisation GitHub, décisions D1–D15.

## M2 — Prototype jouable
**2a. Sensation de vol** ✅ *(v0.1 → v0.5, 13–14/11/2026)*
- Physique maison, vol à un doigt (D16), atterrissage noté, aides, 3 avions au caractère calculé (T10).

**Pivot « livreur de colis aux îles »** ✅ *(étape A, 14/11/2026 : conception sans code)*
- Document de pivot, décisions D17–D20, 10 exemples de commandes pour valider le ton.

**2b. v0.6 « Première livraison »** ✅ *(14/11/2026)*
- 2 îles (Dépôt, Cocotte), 3 colis (carton, œufs fragiles, poules qui bougent).
- Colis chargé = masse, centre de gravité et traînée en plus : les barres des 3 avions changent.
- Écran de commande (pictos + message drôle), écran « Note client » (étoiles, avis, état du colis, paiement).
- Tests : chaque commande réussissable avec au moins une configuration ; poids ≤ 4 Mo.

**2c. Point go / no-go** — « est-ce plus amusant que la v0.5 ? » (test du porteur du projet et de son fils).

**2d. Hangar à emplacements** *(≈ 8–12 j, après le go)*
- Emplacements de pièces + emplacements de colis, ~24 pièces, effet visible avant de poser une pièce.
- Pip en tenue LivrÎle, 3–4 cosmétiques, dégâts visibles, 10–15 bruitages, sauvegarde minimale.

## M3 — MVP complet *(≈ 25–35 j)*
- 9 îles, ~25 commandes rejouables avec meilleure note à battre, météo (alizés, orages, brume), îles qui changent (Île Moitié).
- Économie Boulons, ~40 pièces, badges, ~50 cosmétiques (cadeaux de clients).
- Sauvegarde robuste, FR + EN.
- SDK Poki (« Livraison suivante », « Pourboire ×2 », « Louer cette pièce »), après relecture des règles officielles (#3).
- Graphismes zéro budget dans le style « affiche de voyage tropicale détournée » (D8/D17).

## M4 — Polish *(≈ 10–15 j)*
- Animations, effets, son et musique, équilibrage par tests, performance mobile, nom final.

## M5 — Soumission Poki *(≈ 4–6 j + délai Poki)*
- Build final, Poki Inspector, compatibilité, miniature (Pip trempé + colis qui flotte), description FR/EN.

## Plus tard (hors MVP)
- Amerrissage d'urgence, puis îles accessibles seulement par l'eau (D19).
- Largage de colis : **non** (D18).
