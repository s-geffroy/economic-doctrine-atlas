# Project Manifest — Atlas doctrinal V0.1

## Corpus

- Dimensions doctrinales : 12
- Écoles : 19
- Économistes : 57
- Variantes temporelles d’économistes : 6
- Banque d’items : 108
- Items d’ancrage : 20
- Plafond utilisateur : 35 questions
- Fiches HTML dédiées : 76

## Validation exécutée dans l’environnement de génération

- `python3 scripts/validate_data.py` : OK
- `python3 tests/test_model.py` : OK
- transpilation syntaxique des TS/TSX : 9 fichiers, 0 erreur
- `py_compile` backend + scripts : OK
- profils canoniques : 19/19 top-1
- perturbation synthétique exploratoire : 88,7 % top-1 ; 99,5 % top-3 (40 simulations/école)

## Limite de validation technique, levée depuis

Le registre npm n’était pas accessible dans l’environnement de génération de la
V0.1 : ni `npm install`, ni `tsc`, ni le build Vite n’y avaient réellement tourné.
La première exécution avec accès au registre a fait apparaître une erreur
`TS2352` dans `src/App.tsx` — les imports JSON sont inférés en types littéraux
qui ne recouvrent pas `Record<string, number>`. Corrigée par un passage explicite
via `unknown`, l’échappatoire prévue par TypeScript pour ce cas.

Depuis, `package-lock.json` est commité, `npm ci && npm run build` passe, et la CI
rejoue installation + build à chaque poussée.

## Statut scientifique

Prototype de recherche **non encore psychométriquement validé**. Les profils doctrinaux V0.1 sont des seed codings destinés au double codage indépendant, à l’accord inter-codeurs et à la validation externe décrits dans `docs/`.
