# Backend facultatif

Le questionnaire principal n'en dépend pas. Ce service ne sert qu'à :

- sauvegarder un profil dérivé volontairement ;
- rendre un profil public explicitement ;
- recevoir une contribution scientifique après consentement explicite.

La V0.1 utilise un **owner token** plutôt qu'un compte utilisateur afin d'éviter de livrer un faux système d'authentification. Un compte/magic-link devra être ajouté via un fournisseur d'identité audité avant toute ouverture multi-utilisateur réelle.

Aucune réponse brute n'est stockée lors d'une simple sauvegarde de profil. Les réponses ne sont acceptées que par `/research/contributions` avec `consent: true`.
