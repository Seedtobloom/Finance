---
name: charte-dashboard-stb
description: Charte visuelle et règles de travail du dashboard Seed to Bloom (espace admin de Cindy et espace client). À charger AVANT toute modification d'interface dans ce projet, pour que l'outil Finance ait exactement la même apparence que le dashboard. Déclencher sur "même interface que le dashboard", "refais le style", "maquette", ou toute retouche visuelle.
---

# Charte du dashboard Seed to Bloom

Le but : l'outil Finance doit ressembler au dashboard, pas à un tableau de bord générique.
Le fichier `stb-finance/front/style.css` actuel utilise une ANCIENNE palette
(#051833, #BAD1FD, #E4D1FE, #E85454, #4CAF82...). Elle est à remplacer, pas à retoucher.

Deux fichiers de référence, copiés tels quels depuis le dashboard :
- `reference-admin.css` : jetons de l'espace de Cindy (portée `.ck`, le « cockpit », la version la plus récente).
- `reference-client.css` : jetons de l'espace client.
Toujours partir de ces valeurs, ne jamais en inventer.

## Couleurs (les seules autorisées, plus leurs opacités)

| Nom | Hex | Usage |
|---|---|---|
| Ébène | #110704 | texte, barre latérale, bandeau d'en-tête, panneau ouvert |
| Ciel (Azur) | #C5DEFF | accent principal, bouton principal, « ça avance » ; fond pâle #EAF2FF |
| Paille (Mimosa) | #E6E5B2 | texte clair sur Ébène ; jamais en grand aplat |
| Mandarine | #CD8F6E | ce qui réclame une action ; petite surface |
| Cuivre | #5A2A11 | petite surface seulement (bandeau d'une phrase, texte secondaire fort) |
| Lin / Neige | #F8F6F2 | fond des cartes et des blocs |
| Crème | #F0E9D6 | grands blocs chauds quand le jaune serait trop fort |
| Blanc | #FFFFFF | fond de page |

- Bordures : #e9e5dc (1px, fines). Texte secondaire : rgba(17,7,4,.58).
- **Jamais de rouge**, jamais de vert/orange « alerte » génériques. Un montant négatif ou un retard se dit en Mandarine ou en Cuivre, avec un mot.
- Pastilles de sens, quatre et pas plus : ciel = ça avance, mandarine = ça réclame, ébène = c'est à moi, neutre = c'est posé.

## Typographie

Google Fonts : `Cormorant Garamond` (400, 500, italique), `Alegreya` (400, 500, italique), `Inter Tight` (400, 500, 600).
- Titres : Alegreya (cockpit) ou Cormorant Garamond, letter-spacing -0.025em. Un mot en italique Ciel dans un titre sur fond Ébène est la signature.
- Corps : Alegreya 16.5px, interligne 1.5.
- Boutons, chiffres, libellés, tableaux : Inter Tight, chiffres en `font-variant-numeric: tabular-nums`.

## Formes

- Arrondis de 8 à 28 px : 9px boutons, 16px cartes et panneaux, 20px grands blocs, 24px bandeau d'en-tête, 999px pastilles.
- Pas d'ombres (ou très douces). Profondeur par changement de fond : blanc, puis Lin, puis Ébène pour ce qui est ouvert.
- Barre latérale Ébène 248px, texte Lin à 82 %.
- Bouton principal : fond Ciel, texte Ébène. Bouton sombre : fond Ébène, texte Lin, en pilule.
- Bandeau d'en-tête (`.ck-hero`) : Ébène, chiffre clé en grand en Paille, deux colonnes.

## Interdits (les « tics d'IA » que Cindy refuse)

- Pas de texte tout en majuscules, pas de sur-titres (eyebrows) à la chaîne.
- Pas d'emoji ni d'icônes-glyphes décoratives.
- Pas de bordure colorée sur le côté gauche des cartes.
- Pas de tiret cadratin (—) dans les textes de l'interface.
- Pas de week-end dans les calendriers.
- Bordures de sélection fines (1px), jamais épaisses.
- Pas d'effet qui fait « vibrer » la page au clic (pas de ré-animation des blocs à chaque rendu).

## Méthode de travail (ce qui a fait marcher le dashboard)

1. Répondre en français.
2. **Maquette d'abord, toujours.** Proposer 2 à 4 variantes visibles (fichier HTML rendu ou capture), avec les vraies couleurs et les vraies données. Coder seulement après validation de Cindy.
3. Partir des fichiers de référence ci-dessus, pas de sa mémoire.
4. Après le code, faire une capture (Playwright est installé) à 1440 et 1920 px, et en mobile, puis comparer à la maquette validée. Corriger les écarts avant de montrer.
5. Vérifier les contrastes du texte (au moins 4.5:1).
6. Rester simple et bien segmenté : une idée forte par écran, pas trop d'informations sur une même page, de l'air entre les groupes.
7. Ne pas réécrire ses données ni ses textes.
8. Être critique et proposer, mais ne jamais pousser (git push) sans un « pousse » explicite : un push met en ligne.
9. Skills utiles en complément : `interface-design`, `impeccable`, `dataviz` (graphiques), `ponytail` (code sobre).
