# Méthodologie V0.1

## Objet

L’instrument estime un vecteur doctrinal à partir des réponses, sans utiliser l’auto-identification politique ou scolaire dans le score. Les écoles et économistes vivent dans le même espace de dimensions explicites.

## Chaîne de calcul

1. Réponses Likert : valeur dans `[-1, 1]`; « je ne sais pas » et « cela dépend » sont non informatives pour le score.
2. Chaque item possède un vecteur de chargement sparse sur une ou plusieurs dimensions.
3. Le score d’une dimension est une moyenne pondérée des contributions informatives.
4. Une incertitude instrumentale est estimée à partir de la quantité d’information et de la dispersion interne des réponses.
5. Les distances sont calculées séparément dans les espaces analytique et normatif, puis globalement.
6. La proximité affichée vaut `100 × (1 - distance_normalisée)`; elle n’est ni une probabilité ni un pourcentage d’adhésion.
7. Après le noyau commun, la question adaptative maximise la variance des positions prédites des écoles encore candidates.
8. Arrêt anticipé seulement après 25 réponses informatives, avec confiance suffisante et marge suffisante entre les deux premiers profils; plafond absolu 35.

## Géométrie V0.1

La V0.1 utilise une distance euclidienne pondérée et normalisée sur le cube `[-1,1]^n`. Ce choix est volontairement simple et auditable. La validation doit comparer au minimum Euclidienne pondérée, cosinus et Mahalanobis avant stabilisation de la V1 scientifique.

## Région d’école

Chaque école possède `sigma[dimension]`. Ce paramètre représente une tolérance doctrinale initiale et ne doit pas être interprété comme un écart-type empirique avant calibration inter-codeurs.

## Anti-circularité

Le corpus doctrinal est construit indépendamment des résultats utilisateurs. Les données empiriques peuvent falsifier ou suggérer une révision du modèle, mais toute modification doit être versionnée et justifiée sans optimiser directement le résultat attendu.
