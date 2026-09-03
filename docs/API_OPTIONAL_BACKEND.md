# Backend optionnel et comptes

La doctrine produit exige que le test soit utilisable intégralement hors compte et sans transmission de réponses. Le backend ne fait donc jamais partie du chemin critique de scoring.

## V0.1 livrée

- sauvegarde volontaire d'un **profil dérivé** ;
- URL publique opt-in ;
- révocation/activation de visibilité via owner token ;
- contribution scientifique distincte, avec consentement booléen obligatoire.

## Pourquoi le compte complet n'est pas simulé

Une authentification bricolée serait plus dangereuse qu'une fonctionnalité absente. La V1 peut ajouter magic-link/OIDC, mais seulement avec politiques de session, révocation, récupération, journalisation et protection CSRF correctement spécifiées.
