# CARTE DU MONDE & DESTINATIONS — CAN YOU FLY?

> ⚠️ **Obsolète depuis le pivot du 14/11/2026 (D17)** : la carte Paris → Istanbul est remplacée par l'archipel de 9 îles. Voir `docs/PIVOT_LIVREUR_TROPICAL.md` §6. Ce document sera réécrit avec la v0.6.

> Statut : **proposition Phase 1** — l'ordre des villes nécessite la validation de l'utilisateur.
> Responsable : Agent 2. Liés : `GAME_DESIGN.md`, `PROGRESSION_SYSTEM.md`, `DIFFICULTY_BALANCING.md`, `ART_DIRECTION.md`.

---

## 1. Principe : un voyage

Le joueur ne choisit pas un « niveau 4 » : il **part de la dernière ville atteinte** vers la suivante. La carte est le menu principal du méta-jeu.

- Carte d'Europe **stylisée façon affiche de voyage rétro** (pas une carte géographique précise) : côtes simplifiées, monuments en relief, mer avec petites vagues dessinées.
- Les villes atteintes reçoivent un **tampon** + une **carte postale** (illustration réutilisée dans les résultats et comme souvenir dans un « carnet de voyage »).
- Le tracé de chaque vol réussi ou raté est dessiné en pointillés (les tentatives ratées laissent un petit symbole : épave, plouf). La carte raconte l'histoire du joueur.
- Une étape est **validée** dès que le joueur atterrit (GOOD, ROUGH ou CRASH *dans la zone d'arrivée*, cf. §4). L'étape suivante est alors débloquée.

---

## 2. Critique de l'ordre proposé dans le brief

Brief : Paris → Londres → Amsterdam → Berlin → Rome → Athènes → Istanbul.

**Problème 1 — la Manche dès l'étape 1.** Le tout premier vol « réel » imposerait une traversée maritime : pour un débutant avec un avion de départ peu autonome, la quasi-totalité des échecs serait des WATER CRASH. C'est l'échec le moins instructif (« je suis tombé à l'eau » ne dit pas quoi changer) et le plus frustrant pour une première impression sur Poki, où l'on perd le joueur en 1–2 minutes.

**Problème 2 — Londres → Amsterdam** : nouvelle traversée maritime (mer du Nord), la difficulté stagne au lieu de progresser.

**Problème 3 — Berlin → Rome** : très long trajet, passe par les Alpes ; c'est bien comme défi montagne mais il faut le placer après des étapes d'apprentissage.

### Proposition recommandée
```
Étape 0 (tutoriel)  Paris → Reims (campagne de Champagne)          ~45 s
Étape 1             Reims → Bruxelles                              ~70 s
Étape 2             Bruxelles → Amsterdam (polders, canaux)        ~80 s
Étape 3             Amsterdam → Londres  ★ 1re traversée maritime  ~90 s
Étape 4             Londres → Berlin (retour continent, long vol)  ~110 s
Étape 5             Berlin → Rome (Alpes)                          ~130 s
Étape 6             Rome → Athènes (mer Ionienne, îles)            ~130 s
Étape 7             Athènes → Istanbul (mer Égée, îles + Bosphore) ~150 s
```
- Londres reste dans le voyage, mais l'eau arrive **à l'étape 3**, quand le joueur sait piloter et a débloqué un réservoir plus grand / des ailes de planeur.
- La progression de difficulté est lisible : terre → canaux (petite eau) → mer → montagne → mer + îles → mélange final.
- *Alternative plus proche du brief* : garder Paris → Londres en étape 1 mais avec une **traversée courte (Calais–Douvres) précédée d'une longue campagne**, un « ferry » qui sert de zone de secours balisée, et un réservoir de départ suffisant. Possible, mais je la déconseille : elle oblige à tricher sur l'eau dès la première vraie étape.

*Les distances et durées sont arcade (cf. brief) ; seules la direction et l'ordre respectent vaguement la géographie.*

---

## 3. Fiche par étape (MVP)

| # | Étape | Biomes | Défi principal | Zones d'atterrissage | Obstacles | Événements | Élément reconnaissable |
|---|-------|--------|----------------|----------------------|-----------|------------|-----------------------|
| 0 | Paris → Reims | Ville (départ), campagne | Apprendre cabrer/piquer et atterrir | Piste de l'aérodrome (★), grand champ (facile) | Quelques arbres, clôture | 1 anneau, 1 ascendant | Tour Eiffel au départ, vignes, cathédrale |
| 1 | Reims → Bruxelles | Campagne, forêt | Gérer le carburant (1re panne sèche possible) | Piste courte (★★), prairie, parc urbain | Arbres, éoliennes, granges | Vent de face léger, anneaux | Atomium |
| 2 | Bruxelles → Amsterdam | Polders, canaux, ville | Précision : l'eau des canaux entre les champs | Piste (★★), digue étroite (★★★), champ de tulipes | Moulins, canaux (eau !), péniches | Rafales côtières | Moulins, canaux, maisons étroites |
| 3 | Amsterdam → Londres | Littoral, mer, campagne anglaise | 1re traversée : autonomie ou plané | Piste Heathrow-like (★★), champ (★), plage de Douvres (★★, étroite, falaises) | Falaises blanches, phares, bateaux | Vent latéral, ascendants au-dessus des falaises | Big Ben, falaises de Douvres |
| 4 | Londres → Berlin | Mer, campagne, forêt, ville | Endurance (long vol) | Piste (★★), parc (★★), grand champ | Grues, bâtiments, arbres | Vent dans le dos (aide), anneaux en série | Porte de Brandebourg, tour TV |
| 5 | Berlin → Rome | Montagne (Alpes), collines | Altitude : franchir les cols ou trouver les ascendants | Plateau alpin (★★★), piste (★★★), champ d'oliviers en pente (★★) | Pics, câbles de téléphérique, sapins | Turbulences, ascendants, rafales | Alpes enneigées, Colisée |
| 6 | Rome → Athènes | Littoral, mer, îles | Navigation d'île en île (relais) | Petite piste insulaire (★★★), plage (★★), piste d'Athènes (★★) | Falaises, rochers, voiliers | Vent latéral fort, rafales | Parthénon, îles blanches |
| 7 | Athènes → Istanbul | Îles, mer, ville dense | Tout combiner + atterrissage urbain serré | Piste (★★★), toit plat (★★★, bonus), parc (★★) | Minarets, ponts du Bosphore, bâtiments | Vents changeants, turbulences | Bosphore, coupoles, ponts |

Légende : ★ facile → ★★★ difficile. Chaque étape propose toujours au moins une zone ★ ou ★★ accessible avec un avion « correct » (règle d'équité).

### Zones de secours exceptionnelles (au-dessus de l'eau)
Pour que les étapes maritimes restent justes : **îlots**, **ferry / plateforme pétrolière** (étape 3, 6, 7), clairement signalés par une bouée-pancarte jaune « SOS » visible de loin. Elles comptent comme atterrissage ROUGH au mieux (« vol validé mais pas à destination ») et ne valident pas l'étape. **L'eau elle-même n'est jamais une surface d'atterrissage.**

---

## 4. Qu'est-ce qu'« arriver » ?

- **Zone d'arrivée** = les dernières ~15 % de l'étape, autour de la ville. Atterrir n'importe où dedans (GOOD/ROUGH/CRASH) **valide l'étape** ; PERFECT/GOOD sur la piste donne le bonus.
- Atterrir **avant** la zone d'arrivée = vol non validé mais récompensé à la distance (« Atterri dans un champ à 15 km de Londres »). La distance restante est affichée sur la carte.
- Idée **à valider** : pouvoir **repartir de l'endroit atteint** (relais) plutôt que de la ville de départ ? Recommandation : **non pour le MVP** (complexité de sauvegarde, et refaire l'étape entière est la boucle d'apprentissage), mais un **record de distance par étape** est affiché pour mesurer les progrès.

---

## 5. Narration du voyage dans les résultats

Gabarit : **« Départ de {ville}. Destination {ville}. {Résultat} {lieu} {distance relative}. »**
- « Départ de Paris. Destination Reims. Atterrissage parfait sur la piste de Reims. »
- « Départ d'Amsterdam. Destination Londres. Plouf dans la mer du Nord, à 23 km de la côte anglaise. »
- « Départ de Berlin. Destination Rome. Atterri sur un plateau alpin, à mi-chemin. Les chèvres sont impressionnées. »

Le **carnet de voyage** (MVP) liste : villes atteintes, meilleur atterrissage par ville, record de distance par étape, cartes postales collectionnées.

---

## 6. Après le MVP

- **Deuxième région** : Afrique du Nord / Moyen-Orient (désert : ascendants thermiques, tempêtes de sable) ou Scandinavie (fjords, neige → patins de luge utiles). Chaque région = 6–8 étapes, 1–2 nouveaux biomes, 1 mécanique d'événement.
- **Étapes bonus** : défis courts (« atterrir sur le porte-avions », « passer sous le pont »).
- **Météo du jour** : variante quotidienne d'une étape existante (rejouabilité à bas coût).
- **Retour à l'envers** : Istanbul → Paris en mode difficile (réutilise les assets).
