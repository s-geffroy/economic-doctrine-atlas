# Atlas doctrinal de la pensée économique

Site web open source permettant de positionner un répondant dans un espace doctrinal multidimensionnel et de le comparer à des écoles économiques et à des économistes de référence.

## Statut scientifique

**V0.1 = prototype de recherche complet mais non validé psychométriquement.** Le repo contient le moteur, le référentiel seed, la banque d’items, les protocoles de double codage et de validation. Les coordonnées actuelles ne doivent pas être présentées comme des mesures académiquement établies tant que le protocole inter-codeurs et la validation externe n’ont pas été exécutés.

## Contenu V0.1

- 12 dimensions doctrinales, séparées en espaces analytique et normatif ;
- 19 écoles représentées par un centroïde + une région d’incertitude ;
- 57 économistes comme profils autonomes ;
- 108 items, dont 20 items d’ancrage et 84 items adaptatifs/scénarios ;
- sélection adaptative par variance attendue entre écoles candidates ;
- scoring déterministe, calcul local et score de confiance instrumentale ;
- pages d’exploration des écoles, économistes, dimensions et sources ;
- protocoles de codage, validation, confidentialité et falsification ;
- CI GitHub Pages.

## Exécution

```bash
npm ci
npm run validate:data
npm test
npm run dev
```

## Publication

En ligne sur <https://www.ligne-de-crete.fr/economic-doctrine-atlas/>, servi par
le site de ligne de crête depuis un tag de ce dépôt. Voir `docs/DEPLOYMENT.md`.

L'ancre `#test` est un point d'entrée public : `…/economic-doctrine-atlas/#test`
démarre le questionnaire directement, sans passer par le bandeau d'accueil.
C'est le lien que pose la fiche du travail sur le site.

## Principes durs

1. Le questionnaire mesure d’abord des dimensions ; il n’additionne pas directement des points à des écoles.
2. Analyse positive et préférence normative restent séparées dans les résultats principaux.
3. Une école est une région doctrinale, pas seulement un point.
4. L’affiliation historique d’un économiste est distincte de sa proximité calculée.
5. « Je ne sais pas » et « cela dépend » n’inventent aucune position.
6. Aucune réponse isolée ne détermine un diagnostic.
7. Les projections visuelles 2D/3D ne remplacent jamais la distance dans l’espace complet.
8. Le score 0–100 est une proximité normalisée, jamais une probabilité d’appartenance.
9. Toute coordonnée importante doit être traçable à des sources et à une décision de codage.
10. Aucun profil ne peut être déplacé pour améliorer artificiellement la classification.

## Documentation

Voir `docs/` : méthode, dimensions, taxonomie, protocole de codage, validation, confidentialité, registre académique et feuille de route.

## Extensions incluses

- `economist_variants.json` : premiers profils temporels distincts pour auteurs dont l’évolution intellectuelle est substantielle ;
- `public/reference/` : fiches HTML dédiées pour chaque école et économiste ;
- `server/` : backend facultatif de sauvegarde/partage/contribution scientifique, séparé du scoring local ;
- `docs/AUDIT_REPORT.md` : falsification canonique et bruit synthétique ;
- `schemas/` : contrats JSON minimaux du corpus.
