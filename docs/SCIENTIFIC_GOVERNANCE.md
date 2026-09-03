# Gouvernance scientifique

## Registres versionnés

- `Doctrine Model` : dimensions, profils, régions et métriques ;
- `Questionnaire` : banque d’items et règles adaptatives ;
- `Reference Corpus` : sources et décisions de codage ;
- `Scoring Engine` : implémentation calculatoire.

## Changement de modèle

Toute modification d’une coordonnée, d’un axe ou d’une pondération exige : issue motivée, sources, impact attendu, auteur/reviewer, test de régression et incrément de version. Une modification déclenchée par un mauvais résultat empirique doit être traitée comme une nouvelle hypothèse et évaluée sur un jeu séparé.

## Gel avant validation

Le modèle doctrinal doit être gelé avant chaque campagne de validation. Les données qui ont motivé une modification ne peuvent pas être utilisées comme preuve confirmatoire de cette modification.
