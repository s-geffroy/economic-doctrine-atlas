# Audit interne V0.1

## Résumé

L'audit distingue volontairement **validité structurelle** et **validation scientifique**. Les tests ci-dessous montrent que le moteur et le corpus seed sont cohérents avec eux-mêmes ; ils ne prouvent pas que les coordonnées doctrinales sont vraies ni que le questionnaire est psychométriquement validé.

## Validation structurelle

- données JSON : dimensions, écoles, économistes, questions et chargements vérifiés ;
- plages de coordonnées : toutes dans `[-1,1]` ;
- banque : 108 items ;
- noyau commun : 20 items ;
- référentiel : 19 écoles, 57 économistes, 12 dimensions ;
- TypeScript du moteur : `tsc --noEmit` **échouait** en V0.1 (TS2352 sur les
  imports JSON), l'environnement de génération n'ayant pas accès au registre
  npm pour l'exécuter réellement ; corrigé en 0.1.1, la compilation passe ;
- backend Python : `py_compile` réussi.

## Falsification canonique

Les profils canoniques simulés sont générés à partir des vecteurs de référence, répondent aux items, passent par la sélection adaptative, puis sont reclassés. Résultat : **19/19 écoles top-1**. Ce test détecte surtout des erreurs d'implémentation ou des axes non couverts.

## Perturbation synthétique

Simulation exploratoire : 40 profils par école, perturbation du latent et bruit de réponse. Résultat observé : **88,7 % top-1 ; 99,5 % top-3**.

Confusions dominantes :

- MMT ↔ post-keynésianisme / développementalisme ;
- ordolibéralisme ↔ nouvelle économie institutionnelle ;
- Chicago ↔ monétarisme / nouvelle économie classique.

Ces proximités sont intellectuellement plausibles. La V0.1 **ne déplace donc pas les profils pour améliorer le score**. Elle renforce plutôt la doctrine produit : top-3, marges, incertitude et qualification de profil hybride lorsque l'écart est faible.

## Limites de cet audit

Les simulations utilisent le même espace doctrinal que celui qui génère les réponses ; elles ne constituent donc pas une validation externe. La prochaine falsification réellement probante est le double codage indépendant puis un panel humain séparé du corpus de construction.

## Sortie canonique brute

```text
canonical top-1: 19/19 = 100.0%
OK   classical              -> classical              n=25 self_d=0.068 margin=0.119
OK   neoclassical           -> neoclassical           n=25 self_d=0.078 margin=0.073
OK   austrian               -> austrian               n=25 self_d=0.074 margin=0.201
OK   keynesian              -> keynesian              n=25 self_d=0.071 margin=0.122
OK   post_keynesian         -> post_keynesian         n=25 self_d=0.063 margin=0.042
OK   new_keynesian          -> new_keynesian          n=25 self_d=0.088 margin=0.169
OK   new_classical          -> new_classical          n=25 self_d=0.054 margin=0.068
OK   monetarist             -> monetarist             n=25 self_d=0.063 margin=0.048
OK   chicago                -> chicago                n=25 self_d=0.070 margin=0.037
OK   old_institutional      -> old_institutional      n=25 self_d=0.078 margin=0.062
OK   new_institutional      -> new_institutional      n=35 self_d=0.070 margin=0.037
OK   ordoliberal            -> ordoliberal            n=25 self_d=0.074 margin=0.035
OK   public_choice          -> public_choice          n=25 self_d=0.063 margin=0.069
OK   marxian                -> marxian                n=25 self_d=0.047 margin=0.151
OK   sraffian               -> sraffian               n=25 self_d=0.069 margin=0.131
OK   behavioral             -> behavioral             n=25 self_d=0.061 margin=0.163
OK   ecological             -> ecological             n=25 self_d=0.076 margin=0.074
OK   mmt                    -> mmt                    n=35 self_d=0.060 margin=0.032
OK   developmentalist       -> developmentalist       n=25 self_d=0.069 margin=0.072
```

## Sortie bruitée brute

```text
noisy synthetic top-1=88.7% top-3=99.5% (N=40/school)
mmt                    top1=62.5% top3=97.5%
new_institutional      top1=65.0% top3=100.0%
chicago                top1=75.0% top3=97.5%
developmentalist       top1=82.5% top3=97.5%
marxian                top1=82.5% top3=97.5%
new_classical          top1=85.0% top3=100.0%
ordoliberal            top1=85.0% top3=100.0%
post_keynesian         top1=85.0% top3=100.0%
monetarist             top1=87.5% top3=100.0%
ecological             top1=90.0% top3=100.0%
old_institutional      top1=92.5% top3=100.0%
public_choice          top1=95.0% top3=100.0%
neoclassical           top1=97.5% top3=100.0%
austrian               top1=100.0% top3=100.0%
behavioral             top1=100.0% top3=100.0%
classical              top1=100.0% top3=100.0%
keynesian              top1=100.0% top3=100.0%
new_keynesian          top1=100.0% top3=100.0%
sraffian               top1=100.0% top3=100.0%

Most common confusions:
new_institutional      -> ordoliberal            14
mmt                    -> post_keynesian         11
marxian                -> old_institutional      6
ordoliberal            -> new_institutional      5
post_keynesian         -> mmt                    4
new_classical          -> neoclassical           4
chicago                -> new_classical          4
chicago                -> monetarist             4
mmt                    -> developmentalist       4
monetarist             -> chicago                3
developmentalist       -> mmt                    3
developmentalist       -> old_institutional      3
post_keynesian         -> developmentalist       2
chicago                -> neoclassical           2
old_institutional      -> developmentalist       2
```
