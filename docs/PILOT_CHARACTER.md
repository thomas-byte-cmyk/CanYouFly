# LE PILOTE — CAN YOU FLY?

> Statut : **proposition Phase 1**. Responsable : Agent 2. Liés : `CUSTOMIZATION_SYSTEM.md`, `ART_DIRECTION.md`, `LANDING_AND_CRASH_SYSTEM.md`, `AUDIO_DESIGN.md`.

---

## 1. Identité

- **Nom provisoire : « Pip »** — court, prononçable dans toutes les langues, neutre (le joueur peut lui donner l'allure qu'il veut via la personnalisation), sonne comme un bruit d'oiseau. Alternatives : « Bolo », « Ziggy », « Captain Zou ». *(À valider.)*
- **Âge apparent** : indéfini, jeune adulte. **Genre** : volontairement non marqué par défaut ; cheveux, barbe et tenues permettent toutes les allures.
- **Silhouette** : grosse tête ronde (≈ 45 % de la hauteur), petit corps, grands yeux expressifs, nez rond, **lunettes d'aviateur sur le front** (signature visuelle par défaut, retirable), **écharpe** qui flotte au vent (lit la vitesse !).
- **Personnalité** : *enthousiasme démesuré, compétence douteuse*. Pip croit toujours que ce vol sera le bon. Jamais ridiculisé méchamment : c'est le joueur et Pip contre la gravité.

### Pourquoi un seul personnage
Le brief a raison : un pilote unique richement animé et personnalisable coûte moins cher et crée plus d'attachement que plusieurs pilotes plats. Les cosmétiques portent la variété.

---

## 2. Où et comment on le voit

| Contexte | Cadrage | Détail |
|----------|---------|--------|
| En vol | **Buste dans le cockpit** (tête + épaules + bras) | Doit rester lisible à ~40 px de haut sur mobile → expressions **exagérées**, peu de détails fins. |
| Hangar | Corps entier, à côté de l'avion | Idle, réagit aux pièces posées (pouce levé, grimace si trop lourd). |
| Personnalisation | Corps entier, grand | Tourne légèrement, essaie les objets. |
| Résultats | Corps entier, mis en scène avec l'épave/l'avion | État réel + cosmétiques. |
| Titre / carte | Corps entier | Animations d'ambiance. |

---

## 3. Expressions (visage)

Le visage est composé de **calques remplaçables** : yeux, sourcils, bouche (+ joues). 8 expressions de base suffisent :

| Expression | Yeux | Bouche | Utilisée pour |
|-----------|------|--------|---------------|
| Joie | plissés en arc | grand sourire | décollage, anneau, perfect |
| Concentré | mi-clos, sourcils froncés | langue sortie sur le côté | approche, turbulences légères |
| Surprise | ronds, pupilles petites | « O » | rafale, boost, fusée |
| Peur | très ronds, tremblants | dents serrées | chute, décrochage, obstacle proche |
| Grimace | un œil fermé | bouche en zigzag | collision légère, trop lourd |
| Sonné | spirales | langue pendante | crash |
| Fierté | clin d'œil | sourire en coin | perfect, record |
| Dépité | mi-clos | moue | water crash, panne sèche |

---

## 4. Réactions aux événements (en vol)

| Événement | Réaction (visuel + son) | Durée |
|-----------|-------------------------|-------|
| Décollage | Joie, bras levé, « Wouhou ! » (gibberish) | 1,5 s |
| Accélération / boost | Surprise, joues aplaties par le vent, écharpe à l'horizontale | durée du boost |
| Turbulences | Tête qui ballotte, concentré | durée |
| Virage serré (cabrer fort) | Tête qui s'enfonce dans les épaules | instantané |
| Chute / décrochage | Peur, mains sur le casque | jusqu'à reprise |
| Collision légère | Grimace + petite étoile | 1 s |
| Panne sèche | Regarde la jauge, toque dessus, dépité | 2 s |
| Anneau | Petit poing levé | 0,5 s |
| Approche | Concentré (langue sortie) | jusqu'au contact |

**Règle** : une réaction ne doit jamais masquer l'avion ni distraire au moment critique — pendant les 3 dernières secondes avant contact, seulement « concentré » ou « peur ».

---

## 5. États post-atterrissage

L'état est calculé à partir du résultat (cf. `LANDING_AND_CRASH_SYSTEM.md`) et **superposé** aux cosmétiques.

| Résultat | État | Effets visuels superposés |
|----------|------|---------------------------|
| PERFECT | En pleine forme | Pose de héros, petites étincelles, salut militaire |
| GOOD | Content | Pouce levé, cheveux légèrement ébouriffés |
| ROUGH | Secoué / décoiffé | Mèches dressées (ou plumet du chapeau tordu), casque légèrement de travers, tremblement |
| CRASH | Sonné | Visage noirci par la suie, casque de travers, étoiles/oiseaux qui tournent, lunettes fêlées (calque), fumée sortant des oreilles |
| WATER CRASH | Trempé, abasourdi | Ruisselant, algue sur la tête, poisson qui sort du col, souffle un jet d'eau |
| Décollage raté | Gêné | Se gratte la tête, rougit |

Combinaisons possibles (ex. CRASH + suie + casque de travers). Les effets durent pour l'écran de résultats et **jusqu'au retour au hangar** (Pip s'y nettoie avec une petite animation — renforce l'attachement, coût faible).

---

## 6. Règles d'humour familial

- **Aucune blessure** : pas de sang, pas de bandage, pas de membre cassé, pas de perte de conscience « réaliste ». Le « sonné » est cartoon (étoiles, spirales).
- Pas d'humiliation : les phrases se moquent de la situation, jamais du joueur.
- Pas de dialogues en langue réelle : le pilote parle en **gibberish** (voir `AUDIO_DESIGN.md`) → universel et sans localisation.
- Les animaux sont témoins amusés, jamais victimes (un oiseau percuté repart en titubant avec quelques plumes en moins).

---

## 7. Système de couches de rendu

Le pilote est un **assemblage de calques** (cut-out), animé par tweens. Ordre de dessin (du fond vers l'avant) :

```
 1. Accessoire dos (écharpe, cape, sac)
 2. Bras arrière
 3. Corps / tenue (combinaison, veste)
 4. Cou
 5. Tête (forme + couleur de peau)
 6. Cheveux arrière (longs)
 7. Barbe / moustache
 8. Visage : sourcils, yeux, bouche (expressions)
 9. EFFET temporaire visage (suie, rougeur, eau)
10. Lunettes (portées)
11. Cheveux avant (frange) — variante « compressée » si couvre-chef
12. Couvre-chef (casque, chapeau) — peut recevoir un décalage/rotation « de travers »
13. Lunettes sur le front (si non portées)
14. EFFET temporaire tête (étoiles, algue, fumée, mèches dressées)
15. Bras avant / mains
```

Principes :
- Les **effets temporaires** sont des calques à part (9 et 14) et des **transformations** (rotation du calque 12) : ils ne remplacent jamais un cosmétique.
- La « suie » est un calque teinté semi-transparent masqué par la forme du visage → fonctionne avec n'importe quelle barbe/lunettes.
- Cockpit : en vol, seuls les calques 3 à 15 au-dessus du bord du cockpit sont visibles ; le bord du cockpit (appartenant au fuselage) se dessine entre 3 et le reste.
- Détails techniques (container Phaser, teintes) : à préciser dans `TECHNICAL_ARCHITECTURE.md`.

## 8. Décisions

> **Validées le 13/11/2026** (D8) : nom « Pip », genre non marqué par défaut. Animation cut-out par tweens : décision technique retenue.

1. Nom du pilote (« Pip » recommandé).
2. Pilote au genre non marqué par défaut.
3. Animation cut-out par tweens (pas de Spine).
