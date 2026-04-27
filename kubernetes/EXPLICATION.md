# Explication du déploiement Kubernetes

## 1. Objectif du projet

Le projet **Bakery Stock** est une application de gestion de stock pour une boulangerie.  
Dans sa version Kubernetes, l'objectif est de déployer l'application de manière simple, lisible et facile à expliquer.

Le système déployé contient 5 services :

1. `frontend`
2. `backend-products`
3. `backend-orders`
4. `backend-stock-usage`
5. `mysql`

L'idée générale est la suivante :

- le **frontend** est la seule partie accessible depuis l'extérieur
- les **trois backends** restent internes au cluster
- **MySQL** reste interne aussi et conserve ses données grâce à un volume persistant

Ce choix a été fait pour garder une architecture simple, cohérente avec un projet de cours, tout en montrant les objets Kubernetes les plus utiles.

---

## 2. Vue d'ensemble de l'architecture

Le fonctionnement global est le suivant :

1. l'utilisateur ouvre le frontend dans son navigateur
2. le frontend envoie des requêtes HTTP vers `/api/...`
3. ces requêtes arrivent sur **Nginx** dans le conteneur frontend
4. Nginx redirige ensuite les requêtes vers les bons services Kubernetes :
   - `backend-products-service`
   - `backend-orders-service`
   - `backend-stock-usage-service`
5. les backends utilisent `mysql-service` pour accéder à la base de données
6. MySQL stocke les données sur un volume persistant

On a donc une séparation claire :

- **frontend** : interface utilisateur
- **backends** : logique métier
- **mysql** : stockage des données
- **services Kubernetes** : réseau interne stable entre les composants

---

## 3. Notions Kubernetes essentielles

### 3.1. Qu'est-ce qu'une image Docker ?

Une **image Docker** est un paquet contenant tout ce qu'il faut pour exécuter une application :

- le code
- les dépendances
- la configuration de lancement

Dans ce projet, on construit 4 images applicatives :

- `yannisal/myrepo:frontend`
- `yannisal/myrepo:products`
- `yannisal/myrepo:orders`
- `yannisal/myrepo:stock-usage`

MySQL utilise l'image officielle `mysql:8.0`.

### 3.2. Qu'est-ce qu'un conteneur ?

Un **conteneur** est une instance en cours d'exécution d'une image.

En pratique :

- l'image est le paquet
- le conteneur est l'application qui tourne réellement

### 3.3. Qu'est-ce qu'un Pod ?

Un **Pod** est l'unité d'exécution de base dans Kubernetes.  
Kubernetes ne lance pas directement un conteneur seul : il le lance dans un Pod.

Dans ce projet :

- un Pod frontend exécute le conteneur frontend
- un Pod products exécute le backend products
- un Pod orders exécute le backend orders
- un Pod stock exécute le backend stock usage
- un Pod mysql exécute MySQL

Le Pod est donc ce qui tourne réellement dans le cluster.

### 3.4. Qu'est-ce qu'un Deployment ?

Un **Deployment** est un objet Kubernetes qui décrit **comment un Pod doit être déployé et maintenu**.

Il permet notamment :

- de créer les Pods
- de les recréer s'ils tombent
- de mettre à jour une version
- de garder le nombre souhaité de réplicas

Dans ce projet, chaque application a son Deployment :

- `front-deployment`
- `products-deployment`
- `orders-deployment`
- `stock-deployment`
- `mysql-deployment`

Pourquoi en avoir besoin ?

Parce qu'un Pod seul est trop fragile : s'il disparaît, Kubernetes ne le relance pas automatiquement sans Deployment.

### 3.5. Qu'est-ce qu'un Service ?

Un **Service** donne une **adresse réseau stable** à un ou plusieurs Pods.

C'est important parce que :

- l'IP d'un Pod peut changer
- un Pod peut être recréé
- les autres composants ont besoin d'un nom stable pour communiquer

Dans ce projet :

- `frontend-service` expose le frontend
- `backend-products-service` donne un accès interne stable au backend products
- `backend-orders-service` donne un accès interne stable au backend orders
- `backend-stock-usage-service` donne un accès interne stable au backend stock usage
- `mysql-service` donne un accès interne stable à MySQL

En résumé :

- **Pod** = exécute l'application
- **Service** = donne une adresse stable pour joindre cette application

### 3.6. Qu'est-ce qu'un manifest YAML ?

Un **manifest YAML** est un fichier de configuration Kubernetes.  
Il décrit l'objet que Kubernetes doit créer.

Par exemple, un manifest peut décrire :

- un Deployment
- un Service
- un ConfigMap
- un Secret
- un PersistentVolumeClaim

Pourquoi utilise-t-on des manifests YAML ?

Parce qu'ils permettent de décrire l'infrastructure de manière déclarative :

- on écrit ce qu'on veut
- Kubernetes essaie de faire correspondre l'état réel à cet état souhaité

Dans ce projet, les manifests se trouvent dans `kubernetes/`.

### 3.7. Qu'est-ce qu'un ConfigMap ?

Un **ConfigMap** sert à stocker de la configuration **non sensible**.

Ici, `app-config` contient :

- `DB_HOST: mysql-service`
- `DB_NAME: bakery_stock`

Cela permet de séparer la configuration de l'image Docker.  
L'image reste générique, et la configuration est injectée au moment du déploiement.

### 3.8. Qu'est-ce qu'un Secret ?

Un **Secret** sert à stocker de la configuration **sensible**.

Dans ce projet, `mysql-secret` contient :

- `DB_USER`
- `DB_PASSWORD`
- `MYSQL_ROOT_PASSWORD`

Pourquoi ne pas tout mettre dans le code ?

Parce qu'un mot de passe ne doit pas être écrit en dur dans l'application ou dans l'image si on veut garder une séparation correcte entre code et configuration.

### 3.9. Qu'est-ce qu'un PVC ?

Un **PersistentVolumeClaim** (PVC) est une demande de stockage persistant.

Dans ce projet :

- `mysql-pvc` fournit le stockage de MySQL

Pourquoi est-ce nécessaire ?

Parce que si MySQL stockait ses données seulement dans le conteneur, elles seraient perdues dès que le Pod serait recréé.  
Le PVC permet de garder les données malgré les redémarrages.

---

## 4. Application concrète de ces notions dans Bakery Stock

### 4.1. Pourquoi plusieurs Deployments ?

On a choisi un Deployment par composant, car chaque service a un rôle clair :

- le frontend affiche l'interface
- products gère les produits
- orders gère les commandes
- stock-usage gère les sorties de stock
- mysql stocke les données

Cette séparation rend le projet plus lisible et plus simple à expliquer.

### 4.2. Pourquoi plusieurs Services ?

On a besoin des Services pour deux raisons :

1. permettre la communication interne entre composants
2. exposer uniquement le frontend vers l'extérieur

Les backends et MySQL ne doivent pas être accessibles directement depuis le navigateur.  
Ils sont donc exposés en **interne** dans Kubernetes grâce à des Services stables.

Le frontend, lui, est exposé via `frontend-service` en **NodePort**.

### 4.3. Pourquoi le frontend est le seul service exposé ?

Parce que c'est la seule partie qui doit être visible par l'utilisateur final.

Si on exposait directement les backends :

- l'architecture serait moins propre
- il faudrait gérer davantage de points d'entrée
- on augmenterait le risque de confusion et de configuration réseau inutile

Le frontend devient donc la seule porte d'entrée publique.

### 4.4. Pourquoi utiliser un ConfigMap et un Secret ?

Parce que ce sont deux types d'information différents :

- **ConfigMap** : informations non sensibles
- **Secret** : informations sensibles

Dans Bakery Stock :

- le nom de la base et l'hôte MySQL vont dans le ConfigMap
- les mots de passe vont dans le Secret

### 4.5. Pourquoi utiliser un PVC pour MySQL ?

Parce que la base de données doit survivre à un redémarrage.

Sans PVC :

- le Pod MySQL redémarre
- les données sont perdues

Avec PVC :

- le Pod peut être recréé
- le stockage reste attaché
- les données persistent

### 4.6. Pourquoi MySQL utilise `strategy: Recreate` ?

Le PVC MySQL est en `ReadWriteOnce`, donc il ne peut pas être monté en écriture par deux Pods en même temps.

Avec la stratégie par défaut, Kubernetes pourrait essayer de lancer un nouveau Pod MySQL avant que l'ancien ait complètement libéré le volume.  
Cela peut provoquer un blocage.

`strategy: Recreate` évite ce problème :

- Kubernetes arrête d'abord l'ancien Pod
- puis relance le nouveau

---

## 5. Workflow concret du déploiement

### 5.1. Étape 1 : construire les images Docker

On construit chaque image à partir de son Dockerfile :

- frontend
- products
- orders
- stock-usage

À ce moment-là :

- le code est empaqueté
- les dépendances sont installées
- l'image devient réutilisable dans Kubernetes

### 5.2. Étape 2 : pousser les images sur Docker Hub

Le cluster Kubernetes doit pouvoir récupérer les images.

Comme le projet utilise maintenant un seul repository Docker Hub, on pousse :

- `yannisal/myrepo:frontend`
- `yannisal/myrepo:products`
- `yannisal/myrepo:orders`
- `yannisal/myrepo:stock-usage`

Sans ce push, le cluster ne peut pas forcément tirer les images, ce qui provoque des erreurs du type `ImagePullBackOff`.

### 5.3. Étape 3 : appliquer les manifests Kubernetes

Avec `kubectl apply`, on demande à Kubernetes de créer les objets décrits dans les fichiers YAML :

- ConfigMap
- Secret
- ConfigMap d'initialisation SQL
- Deployment MySQL
- Deployments applicatifs
- Services

`kubectl apply` ne veut pas dire que l'application fonctionne déjà.  
Cela veut simplement dire que Kubernetes a accepté la configuration et essaie de la mettre en place.

### 5.4. Étape 4 : vérifier le rollout

Le **rollout** correspond à la mise en place effective d'un Deployment :

- création des Pods
- démarrage des conteneurs
- attente de disponibilité

Exemple :

```bash
kubectl rollout status deployment/mysql-deployment
```

Cette commande permet de savoir si le déploiement a réellement abouti.

### 5.5. Étape 5 : vérifier l'état réel du cluster

Les commandes suivantes servent à voir l'état des objets :

- `kubectl get pods`
- `kubectl get svc`
- `kubectl get pvc`

Elles permettent de vérifier :

- si les Pods sont bien en `Running`
- si les Services existent bien
- si le PVC MySQL est bien en état `Bound`

### 5.6. Étape 6 : accéder au frontend

Le frontend est exposé par `frontend-service` en **NodePort** sur le port `30080`.

On peut donc accéder à l'application avec :

- `http://<node-ip>:30080`

Si ce n'est pas accessible directement, on peut utiliser :

```bash
kubectl port-forward svc/frontend-service 8080:80
```

et ouvrir :

- `http://localhost:8080`

---

## 6. Le rôle de Nginx et du `/api`

### 6.1. Où se trouve la configuration Nginx ?

La configuration Nginx est dans :

- `kubernetes/dockerfiles/nginx.conf`

Elle est copiée dans l'image frontend par :

- `kubernetes/dockerfiles/front.Dockerfile`

### 6.2. Pourquoi le frontend utilise `/api` ?

Dans le navigateur, le frontend ne peut pas utiliser directement un nom comme :

- `backend-products-service`
- `backend-orders-service`

Ces noms n'existent que dans le réseau interne Kubernetes.

Le frontend envoie donc ses requêtes vers :

- `/api/products`
- `/api/orders`
- `/api/stock-usage`

Autrement dit :

- le navigateur parle au **frontend**
- le frontend, via Nginx, relaie ensuite vers les bons backends

Cela permet :

- de ne pas exposer les backends au public
- d'éviter des problèmes CORS
- de centraliser l'entrée réseau

### 6.3. Comment Nginx fait le lien avec les backends ?

Nginx contient des règles comme :

- `/api/products` -> `backend-products-service:5001`
- `/api/orders` -> `backend-orders-service:5002`
- `/api/stock-usage` -> `backend-stock-usage-service:5003`

Nginx connaît donc les vrais noms internes Kubernetes, alors que le navigateur ne connaît que `/api`.

### 6.4. Pourquoi gérer les chemins avec slash et sans slash ?

Dans Nginx, ces deux chemins ne sont pas interprétés exactement de la même manière :

- `/api/products`
- `/api/products/`

On gère donc :

- le chemin exact sans slash final
- les chemins qui commencent avec le slash final, par exemple `/api/products/123`

Cela évite qu'une requête tombe sur la mauvaise règle et que Nginx renvoie le frontend au lieu de proxyfier vers le backend.

---

## 7. Cas particulier de MySQL et du script d'initialisation

Le script SQL d'initialisation est monté dans :

- `/docker-entrypoint-initdb.d/init.sql`

Ce mécanisme fonctionne seulement quand MySQL démarre avec un **répertoire de données vierge**.

Cela signifie que :

- si le PVC est neuf, le script d'initialisation s'exécute
- si le PVC contient déjà une base existante, le script n'est pas rejoué automatiquement

Donc, si on change le schéma SQL plus tard :

- soit on recrée le PVC
- soit on applique une migration manuelle

---

## 8. Questions probables du professeur

### À quoi sert un manifest YAML ?

Un manifest YAML sert à décrire à Kubernetes ce qu'on veut créer, par exemple un Deployment, un Service, un Secret ou un PVC.

### Pourquoi a-t-on dû faire des Services ?

Parce qu'un Pod peut changer d'IP ou être recréé.  
Le Service fournit un nom stable pour communiquer avec lui.

### Quelle est la différence entre un Pod et un Service ?

Le Pod exécute réellement l'application.  
Le Service donne une adresse réseau stable pour y accéder.

### Pourquoi faire un Deployment au lieu de lancer juste un Pod ?

Parce qu'un Deployment permet à Kubernetes de recréer le Pod automatiquement, de le maintenir et de gérer son déploiement.

### Pourquoi seul le frontend est exposé ?

Parce que c'est la seule partie destinée à l'utilisateur final.  
Les backends et MySQL doivent rester internes au cluster.

### Pourquoi le frontend utilise `/api` ?

Parce que le navigateur ne connaît pas les noms internes Kubernetes.  
Le frontend envoie les requêtes à Nginx sous `/api`, puis Nginx les redirige vers les bons backends.

### Pourquoi a-t-on besoin de Nginx ?

Nginx sert à la fois :

- les fichiers statiques du frontend React
- le proxy des appels API vers les services backend

### Pourquoi utiliser un ConfigMap ?

Pour stocker les variables de configuration non sensibles, comme `DB_HOST` et `DB_NAME`.

### Pourquoi utiliser un Secret ?

Pour stocker les mots de passe et les informations sensibles, par exemple les identifiants MySQL.

### Pourquoi utiliser un PVC ?

Pour que MySQL conserve ses données même si son Pod est recréé.

### Qu'est-ce qu'un rollout ?

C'est le processus par lequel Kubernetes déploie réellement une nouvelle version d'un Deployment et vérifie que les Pods démarrent correctement.

### Que se passe-t-il si un Pod tombe ?

Si le Pod est géré par un Deployment, Kubernetes essaie de le recréer automatiquement.

### Pourquoi MySQL a une stratégie `Recreate` ?

Parce que le volume persistant est en `ReadWriteOnce`.  
On évite ainsi que deux Pods MySQL essaient d'utiliser le même volume en même temps pendant une mise à jour.

---

## 9. Résumé oral possible

Le projet Bakery Stock est découpé en un frontend, trois microservices backend et une base MySQL. Le frontend est la seule partie exposée à l'extérieur. Les backends et MySQL communiquent en interne grâce aux Services Kubernetes, qui donnent des noms réseau stables malgré les redémarrages des Pods. Les Deployments permettent à Kubernetes de gérer les Pods automatiquement. Un ConfigMap contient la configuration non sensible, un Secret contient les mots de passe, et un PVC permet à MySQL de conserver ses données. Le frontend passe par Nginx pour envoyer les requêtes API vers les bons services internes via `/api`. Cette architecture est volontairement simple, mais elle montre clairement les principaux objets Kubernetes et leur utilité dans un projet concret.
