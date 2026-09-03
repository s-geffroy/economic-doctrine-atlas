# Déploiement

## Frontend

Le site est servi par **ligne de crête**, à
<https://www.ligne-de-crete.fr/economic-doctrine-atlas/>.

L'image du site (dépôt `ldc`, `src/Dockerfile`) contient une étape qui clone ce
dépôt sur un **tag épinglé**, exécute `npm ci && npm run build`, et copie `dist/`
sous le préfixe. Publier une nouvelle version se fait donc en deux temps :

1. ici : commiter, puis poser un tag (`v0.2`, …) ;
2. côté `ldc` : avancer le tag dans `src/Dockerfile`, puis `sudo appctl rebuild`.

Le tag inscrit dans le Dockerfile est la seule source de vérité sur la révision
servie — l'outillage de déploiement du VPS n'expose pas d'argument de build.

`vite.config.ts` porte `base: './'` : les chemins d'assets sont relatifs, l'app
fonctionne sous n'importe quel préfixe sans reconfiguration. Il n'y a pas de
routeur côté client, donc aucun *fallback* SPA n'est nécessaire côté serveur —
mais l'adresse **doit** garder sa barre finale, sans quoi les liens relatifs
vers `reference/` sortent du préfixe.

Il n'y a **pas** de publication GitHub Pages : elle ferait doublon avec la
version canonique ci-dessus.

## Backend facultatif

`docker compose up --build` lance l'API sur le port 8000. Le frontend n'en
dépend pas et **ne l'appelle pas** : aucun `fetch` dans `App.tsx`. Il n'est pas
déployé en production. Pour l'y mettre : TLS en reverse proxy, CORS limité au
domaine du site, sauvegarde du volume, gestion des secrets, politique de
rétention et journalisation sans réponses brutes — plus le câblage client, qui
reste à écrire.

## Build local

```bash
npm ci
npm run validate:data
npm test
npm run build
```
