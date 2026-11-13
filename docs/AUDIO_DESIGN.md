# SOUND DESIGN & MUSIQUE — CAN YOU FLY?

> Statut : **proposition Phase 1**. Responsable : Agent 2. Liés : `PILOT_CHARACTER.md`, `TECHNICAL_ARCHITECTURE.md`, `MONETIZATION_STRATEGY.md`.

---

## 1. Identité sonore

**« Bricolage cartoon »** : des sons mécaniques réels mais exagérés (tôle, ressorts, moteur qui tousse) mélangés à des bruitages de dessin animé (boing, sifflements de chute, couinements). Le son doit **faire rire** et **informer** (le moteur qui tousse annonce la panne avant la jauge).

Trois règles :
1. **Le son est un feedback de gameplay** : régime moteur, vent, alerte de vitesse d'approche, contact au sol — tous lisibles à l'oreille.
2. **Pas de fatigue** : variations aléatoires (pitch ±5–10 %, 2–4 variantes par son fréquent), musique qui s'efface en vol au profit du moteur et du vent.
3. **Le jeu reste jouable en muet** (beaucoup de joueurs Poki jouent sans son) : aucune information *uniquement* sonore.

---

## 2. SFX prioritaires

### Prototype (≈ 25 sons — placeholders acceptables)
| Groupe | Sons |
|--------|------|
| Hangar | pose de pièce (clonk bois / métal), retrait, snap, bouton UI, « trop lourd » (grincement) |
| Moteur | démarrage qui tousse, boucle moteur (pitch selon la poussée), toux de panne sèche, coupure |
| Vol | boucle de vent (volume selon la vitesse), sifflement de chute (piqué rapide), anneau (ding), boost |
| Contact | roues sur piste (crissement), herbe (froissement), rebond (boing) |
| Dégâts | collision légère (tôle), pièce qui se détache (pop + clang), crash (fracas cartoon), plouf + gargouillis |
| Résultats | tampon, compteur de pièces, déblocage (fanfare courte), jingles PERFECT / FAIL |
| Pilote | 4 vocalises gibberish : joie, peur, douleur cartoon (« ouille »), victoire |

### MVP (+ ≈ 35 sons)
- Variantes par moteur (tondeuse, bicylindre, turbo, fusée), hélice selon le modèle.
- Événements : rafale (souffle), turbulences (craquements), ascendant (souffle montant), oiseaux.
- Ambiances par biome (boucles légères : campagne/vaches, ville/klaxons lointains, mer/mouettes, montagne/vent + cloches).
- Pilote : 12+ vocalises, réactions au hangar.
- Pièces spéciales : parachute, airbag, ressorts, ballon qui éclate.
- Carte : tracé, tampon de ville, carte postale.

---

## 3. Musique

| Contexte | Style | Remarques |
|----------|-------|-----------|
| Menu / carte | Thème principal : swing/jazz manouche léger ou ukulélé + sifflement, ~110 BPM | Identité « voyage rétro ». |
| Hangar | Variation calme du thème (instrumentation réduite) | Écouté longtemps → très discret. |
| Vol | **Pas de musique continue** : couche rythmique légère qui monte à l'approche | Le moteur et le vent sont la « musique » du vol. |
| Approche | Stinger de tension (batterie/roulement) | Renforce le climax. |
| Résultats | Jingle court selon la catégorie | 2–4 s. |
| Ville atteinte | Jingle avec instrument local (accordéon Paris, cornemuse discrète Londres, bouzouki Athènes…) | Récompense de voyage, petit coût. |

Transitions : **crossfade 0,5–1 s** entre contextes ; boucles bouclant proprement (longueur 60–90 s pour éviter la fatigue).

---

## 4. Voix du pilote

- **Gibberish** (charabia) façon Animal Crossing / Simlish : syllabes enregistrées ou synthétisées, pitchées → universel, aucune localisation.
- Pas de voix réelle : coûte cher, à localiser, et lasse vite.
- Fréquence limitée : une vocalise toutes les 4 s maximum en vol.

---

## 5. Réglages

- Menu réglages : **Musique** (0–100), **Effets** (0–100), bouton **Mute global** visible sur l'écran titre et dans le menu pause.
- Réglages **sauvegardés** (cf. `TECHNICAL_ARCHITECTURE.md`).
- **Pubs Poki** : le jeu **coupe tout le son** au début d'un `commercialBreak` / `rewardedBreak` et le restaure à la fin (exigence Poki à revérifier dans la doc officielle au moment de l'intégration).
- Mise en pause audio quand l'onglet perd le focus.
- Respect des politiques navigateur : l'audio démarre au premier geste utilisateur (le bouton VOLER).

---

## 6. Sources réalistes

| Source | Usage | Licence / attention |
|--------|-------|---------------------|
| **Kenney audio packs** | UI, impacts, placeholders | CC0 |
| **Freesound.org** | Moteurs, vent, ambiances | Filtrer CC0 ; CC-BY → crédits à tenir dans un fichier `CREDITS` ; **exclure CC-BY-NC** (usage commercial) |
| **Sonniss GDC bundles** | Sons pros de qualité | Libres de droits, usage commercial autorisé (vérifier la licence du bundle) |
| **jsfxr / ChipTone** | Sons rétro de prototype | Libre |
| **Générateurs IA de SFX** | Variantes cartoon | Vérifier les conditions commerciales de l'outil choisi |
| **Musique** : compositeur freelance ou bibliothèques libres (ex. Incompetech/Kevin MacLeod CC-BY, ou packs payants à licence perpétuelle) | Thème + variations | Une identité musicale propre est préférable pour le MVP ; budget indicatif freelance 300–1 000 € pour 3–4 morceaux courts |

Tenir un **registre des sources et licences** dès le premier son intégré.

---

> **Décision D9 (13/11/2026)** : zéro budget pour l'instant → SFX et musique **libres de droits** (CC0 / CC-BY avec attribution listée dans `assets/LICENSES.md`). Compositeur freelance seulement si le jeu rencontre son public.

## 7. Budget poids & formats

- Format : **OGG (Vorbis/Opus) + M4A/AAC** en repli (compatibilité Safari/iOS à vérifier selon les versions ciblées) ; Phaser charge la première source compatible.
- SFX : mono, 44,1 kHz → 22–32 kHz si inaudible, **courts (< 1,5 s)**, ~64 kbps.
- Musique : stéréo 96 kbps, chargée **après** le premier écran (non bloquante).
- Option : **audio sprite** (un fichier regroupant les SFX) pour réduire les requêtes.
- Budget : **≤ 600 Ko au chargement initial** (SFX essentiels), **≤ 3 Mo au total** pour le MVP (musique incluse, chargée en différé).

## 8. Décisions à valider
1. Pas de musique continue en vol (moteur + vent + couche de tension à l'approche).
2. Pilote en gibberish (pas de voix réelle).
3. Style musical « voyage rétro » (swing/ukulélé) cohérent avec la piste artistique A.
