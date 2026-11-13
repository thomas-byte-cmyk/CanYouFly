# SYSTÈME DE PERSONNALISATION — CAN YOU FLY?

> Statut : **proposition Phase 1**. Responsable : Agent 2. Les coûts et rythmes de déblocage chiffrés relèvent de `PROGRESSION_SYSTEM.md` / `MONETIZATION_STRATEGY.md` (Agent 4).

---

## 1. Principes

1. **Purement esthétique** : aucun cosmétique n'a d'effet sur la physique, les stats ou les récompenses. (Si un objet *a l'air* aérodynamique, il ne l'est pas.)
2. **Toujours visible** : les cosmétiques restent affichés quel que soit l'état temporaire du pilote (suie, casque de travers, trempé).
3. **Combinatoire plutôt que quantité** : peu d'objets bien pensés × teintes × calques = beaucoup de looks.
4. **Gagné, jamais acheté avec de l'argent réel** (pas d'IAP sur Poki).

---

## 2. Catégories

| Catégorie | Calque (cf. `PILOT_CHARACTER.md` §7) | Teintable | Exemples |
|-----------|--------------------------------------|-----------|----------|
| Couvre-chef — casques | 12 | oui (1 zone) | casque cuir d'aviateur (défaut), casque de moto, casque de chantier, casque spatial en bocal |
| Couvre-chef — chapeaux | 12 | oui | béret, chapeau de cowboy, toque de chef, couronne en carton, bonnet à pompon |
| Lunettes | 10 / 13 | parfois | lunettes d'aviateur (défaut), lunettes rondes, lunettes de soleil cœur, monocle, masque de plongée |
| Cheveux | 6 / 11 | **oui (couleur libre parmi palette)** | court, en bataille, chignon, tresses, afro, mohawk, chauve |
| Pilosité faciale | 7 | oui (même palette que cheveux) | aucune, moustache en guidon, barbe courte, grande barbe |
| Tenues | 3 | oui (2 zones) | combinaison de mécano (défaut), veste aviateur, marinière, smoking, costume de super-héros |
| Accessoires dos | 1 | oui | écharpe (défaut), cape, sac à dos, petites ailes en carton |
| Accessoires main / divers | 15 | non | carte routière, baguette, peluche, mouchoir à agiter |
| Teint de peau | 5 | 8 teintes | sélection libre dès le départ (jamais à débloquer) |

**Règle d'inclusivité** : teint de peau, coiffures de base et couleurs de base sont **disponibles dès le départ** — on ne débloque pas son identité, seulement des fantaisies.

---

## 3. Calques et compatibilités

### 3.1 Couvre-chef + cheveux
Chaque coiffure existe en **2 versions** :
- *Libre* : dessinée entièrement (calques 6 + 11).
- *Compressée* : partie haute masquée, seules les mèches dépassant sous le couvre-chef sont visibles.

Chaque couvre-chef déclare un **type de masque** : `aucun` (couronne), `bas` (béret), `total` (casque intégral, bocal spatial). La combinaison choisit automatiquement la bonne version. → Pas de dessin spécifique par paire, seulement 2 versions par coiffure.

### 3.2 Lunettes + couvre-chef
- Lunettes portées : toujours compatibles.
- « Lunettes sur le front » : désactivé si le couvre-chef est de type `total`.

### 3.3 Barbe + accessoires visage
- Masque de plongée / bocal : la barbe reste visible (dessinée par-dessus le bas du masque, cartoon assumé).

### 3.4 Effets temporaires (rappel)
- Casque de travers = rotation (8–15°) + décalage du calque 12, valable pour tous les couvre-chefs grâce à un **point de pivot** commun défini par asset.
- Suie / eau = calques d'effet masqués par la forme de la tête.

### 3.5 Contraintes de production par objet
Chaque cosmétique est livré avec : sprite(s), zone(s) teintable(s) en niveau de gris, point de pivot, type de masque, version « cockpit » si l'objet dépasse (ex. grande cape repliée en vol).

---

## 4. Teintes

- Palette fixe de **12 couleurs** cohérentes avec la DA (pas de sélecteur RGB libre : garantit la cohérence visuelle et la lisibilité).
- Teintes **débloquées progressivement** au-delà des 6 premières (récompense légère, peu coûteuse à produire).
- Certaines couleurs « spéciales » (or, arc-en-ciel animé, chrome) réservées aux badges Or.

---

## 5. Déblocage (lien avec la progression)

Sources de cosmétiques (proportions à équilibrer par l'Agent 4) :

| Source | Exemples | Rôle |
|--------|----------|------|
| **Villes atteintes** (souvenir de voyage) | Béret (Paris), chapeau melon (Londres), sabots / bonnet à tulipe (Amsterdam), bonnet bretzel (Berlin), couronne de laurier (Rome), casque grec en carton (Athènes), fez (Istanbul) | **Signature du voyage** : chaque ville a son souvenir. |
| **Badges Bronze / Argent / Or** | Lunettes cœur (10 atterrissages parfaits), cape de héros (Or) | Récompenser la maîtrise. |
| **Boutique avec monnaie du jeu** | La majorité des chapeaux, tenues, teintes | Puits de monnaie secondaire. |
| **Défis / records** | Monocle (record de distance), bocal spatial (altitude max) | Objectifs de long terme. |
| **Pub récompensée (optionnelle)** | « Essai » d'un cosmétique pour le prochain vol ou réduction en boutique | Jamais le seul moyen d'obtenir un objet. |
| **Événements spéciaux** *(plus tard)* | Bonnet de Noël, citrouille | Rétention saisonnière. |

Les objets non encore débloqués sont **visibles en silhouette** avec leur condition (« Atteins Rome ») → crée l'envie.

---

## 6. Écran de personnalisation (UX)

- Accessible depuis le hangar (bouton « vestiaire » avec la tête de Pip).
- Pip en grand au centre, catégories en onglets-icônes, grille d'objets, palette de teintes sous l'objet sélectionné.
- **Bouton « Hasard »** (dé) : look aléatoire parmi les objets possédés — très apprécié des enfants, coût nul.
- Aperçu en direct incluant un bouton « tester l'état crash » (montre Pip noirci avec le look) → rassure sur la persistance des cosmétiques et c'est drôle.

---

## 7. Volume

| Catégorie | Prototype | MVP | Plus tard |
|-----------|-----------|-----|-----------|
| Casques / chapeaux | 3 | 14 (dont 7 souvenirs de ville) | +saisonniers |
| Lunettes | 2 | 6 | |
| Cheveux (×2 versions) | 3 | 8 | |
| Pilosité | 2 | 4 | |
| Tenues | 2 | 8 | |
| Accessoires dos | 1 | 4 | |
| Accessoires main | 0 | 4 | |
| Teintes | 6 | 12 | spéciales |
| **Total objets** | **~13** | **~48** | |

Prototype : objectif = **valider le système de calques et la superposition des effets**, pas la quantité.

## 8. Décisions à valider
1. Palette fixe de teintes (pas de sélecteur libre).
2. Souvenirs de ville comme récompense signature.
3. Teint de peau et coiffures de base disponibles dès le départ.
