# Déploiement

## Frontend

Le site est publié par **GitHub Pages**, à
<https://s-geffroy.github.io/economic-doctrine-atlas/>.

Le workflow `.github/workflows/pages.yml` s'exécute à chaque push sur `main` :
il valide les données (`scripts/validate_data.py`), passe les tests du modèle,
exécute `npm ci && npm run build`, puis publie `dist/`. Une version qui échoue
aux contrôles n'est jamais publiée. Les tags (`v0.2.0`, …) marquent les
versions ; ils ne pilotent plus la publication.

`vite.config.ts` porte `base: './'` : les chemins d'assets sont relatifs, l'app
fonctionne sous n'importe quel préfixe sans reconfiguration. Il n'y a pas de
routeur côté client, donc aucun *fallback* SPA n'est nécessaire. L'adresse
**doit** garder sa barre finale, sans quoi les liens relatifs vers `reference/`
sortent du préfixe (GitHub Pages l'ajoute de lui-même par redirection).

Les polices IBM Plex sont embarquées dans `public/fonts/` (licence OFL jointe) :
l'Atlas ne dépend d'aucun fichier servi par ligne-de-crete.fr.

Jusqu'à la v0.1.2, l'Atlas était servi par ligne de crête sous
`https://www.ligne-de-crete.fr/economic-doctrine-atlas/`. Cette adresse redirige
désormais en 301 vers la même page ici, chemin compris ; les URL canoniques des
pages pointent vers GitHub Pages.

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
