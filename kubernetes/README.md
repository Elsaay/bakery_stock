# Déploiement Kubernetes - Bakery Stock

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Kubernetes Cluster                        │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │    Front     │  │   Products   │  │    Orders    │          │
│  │   NodePort   │  │   NodePort   │  │   NodePort   │          │
│  │   :30000     │  │   :30001     │  │   :30002     │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                 │                 │                   │
│         ▼                 ▼                 ▼                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ front:3000   │  │products:5001 │  │ orders:5002  │          │
│  └──────────────┘  └──────┬───────┘  └──────┬───────┘          │
│                           │                 │                   │
│                           ▼                 ▼                   │
│                    ┌─────────────────────────────┐              │
│                    │      MySQL Service          │              │
│                    │       ClusterIP             │              │
│                    │       :3306                 │              │
│                    └──────────────┬──────────────┘              │
│                                   │                              │
│                          ┌────────▼────────┐                     │
│                          │   MySQL:8       │                     │
│                          │   PVC: 1Gi      │                     │
│                          └─────────────────┘                     │
└─────────────────────────────────────────────────────────────────┘
```

## Ports NodePort

| Service | Port NodePort | URL d'accès |
|---------|---------------|-------------|
| Frontend | 30000 | `http://<NODE_IP>:30000` |
| Products API | 30001 | `http://<NODE_IP>:30001` |
| Orders API | 30002 | `http://<NODE_IP>:30002` |
| Stock API | 30003 | `http://<NODE_IP>:30003` |

## Prérequis

1. Cluster Kubernetes fonctionnel (via Portainer ou autre)
2. Docker Hub account
3. kubectl configuré

## Étapes de déploiement

### 1. Récupérer le `NODE_IP`

Le `NODE_IP` correspond à l'adresse IP du noeud Kubernetes sur lequel les services `NodePort` seront exposés.

#### Via `kubectl`

```bash
kubectl get nodes -o wide
```

Utilisez la valeur de la colonne `INTERNAL-IP`.

#### Via Portainer

1. Sélectionnez votre environnement dans Portainer
2. Cliquez sur **Cluster**
3. Cliquez sur votre noeud (par exemple `orbstack`)
4. Relevez l'adresse IP indiquée dans les détails du noeud (`Internal IP` / `IP address`)

Cette valeur sera ensuite utilisée à la place de `NODE_IP` ou `<NODE_IP>` dans les URLs et variables d'environnement.

### 2. Build des images Docker

```bash
cd /Users/20016375/Documents/dev/cours/kubernetes/bakery_stock

# Remplacez YOUR_DOCKERHUB_USERNAME par votre username Docker Hub
export DOCKER_USER=YOUR_DOCKERHUB_USERNAME

# Build products
docker build -f kubernetes/dockerfiles/products.Dockerfile -t $DOCKER_USER/bakery-products:latest .

# Build orders
docker build -f kubernetes/dockerfiles/orders.Dockerfile -t $DOCKER_USER/bakery-orders:latest .

# Build stock
docker build -f kubernetes/dockerfiles/stock.Dockerfile -t $DOCKER_USER/bakery-stock-usage:latest .

# Build front
docker build -f kubernetes/dockerfiles/front.Dockerfile \
  --build-arg REACT_APP_PRODUCTS_URL=http://<NODE_IP>:30001 \
  --build-arg REACT_APP_ORDERS_URL=http://<NODE_IP>:30002 \
  --build-arg REACT_APP_STOCK_URL=http://<NODE_IP>:30003 \
  -t $DOCKER_USER/bakery-front:latest .
```

### 3. Push vers Docker Hub

```bash
docker push $DOCKER_USER/bakery-products:latest
docker push $DOCKER_USER/bakery-orders:latest
docker push $DOCKER_USER/bakery-stock-usage:latest
docker push $DOCKER_USER/bakery-front:latest
```

### 4. Modifier les deployments

Remplacez `YOUR_DOCKERHUB_USERNAME` dans les fichiers suivants :
- `kubernetes/deployments/products-deployment.yaml`
- `kubernetes/deployments/orders-deployment.yaml`
- `kubernetes/deployments/stock-deployment.yaml`
- `kubernetes/deployments/front-deployment.yaml`

Remplacez aussi `NODE_IP` dans `kubernetes/deployments/front-deployment.yaml` par l'adresse IP récupérée à l'étape 1.

### 5. Déploiement via Portainer

1. Allez dans Portainer → Kubernetes → Stacks
2. Cliquez sur "Add stack"
3. Donnez un nom (ex: `bakery-stock`)
4. Sélectionnez "Repository" ou "Web Editor"
5. Si Web Editor, copiez-collez TOUS les fichiers YAML dans l'ordre :
   - `kubernetes/config/secrets.yaml`
   - `kubernetes/config/configmap.yaml`
   - `kubernetes/deployments/mysql-deployment.yaml`
   - `kubernetes/deployments/products-deployment.yaml`
   - `kubernetes/deployments/orders-deployment.yaml`
   - `kubernetes/deployments/stock-deployment.yaml`
   - `kubernetes/deployments/front-deployment.yaml`
   - `kubernetes/services/all-services.yaml`
6. Cliquez sur "Deploy the stack"

### 6. Déploiement via kubectl

```bash
kubectl apply -f kubernetes/config/secrets.yaml
kubectl apply -f kubernetes/config/configmap.yaml
kubectl apply -f kubernetes/deployments/mysql-deployment.yaml
kubectl apply -f kubernetes/deployments/products-deployment.yaml
kubectl apply -f kubernetes/deployments/orders-deployment.yaml
kubectl apply -f kubernetes/deployments/stock-deployment.yaml
kubectl apply -f kubernetes/deployments/front-deployment.yaml
kubectl apply -f kubernetes/services/all-services.yaml
```

## Vérification

### Vérifier les pods

```bash
kubectl get pods -l app=bakery-stock
kubectl get pods -l app=mysql
kubectl get pods
```

### Vérifier les services

```bash
kubectl get services
```

### Vérifier les logs

```bash
kubectl logs -l app=products
kubectl logs -l app=orders
kubectl logs -l app=stock
kubectl logs -l app=front
kubectl logs -l app=mysql
```

### Tester l'application

```bash
# Remplacez NODE_IP par l'IP de votre noeud Kubernetes

# Tester le frontend
curl http://<NODE_IP>:30000

# Tester l'API products
curl http://<NODE_IP>:30001

# Tester l'API orders
curl http://<NODE_IP>:30002

# Tester l'API stock
curl http://<NODE_IP>:30003
```

## Dépannage

### Pod en état CrashLoopBackOff

```bash
kubectl logs <pod-name>
kubectl describe pod <pod-name>
```

### Probleme de connexion à MySQL

Vérifier que le pod MySQL est prêt :
```bash
kubectl get pods -l app=mysql
kubectl logs -l app=mysql
```

### Frontend ne peut pas joindre les APIs

1. Vérifier que les NodePorts sont corrects
2. Modifier `front-deployment.yaml` avec la bonne IP du noeud
3. Redéployer : `kubectl rollout restart deployment/front-deployment`

## Nettoyage

```bash
kubectl delete -f kubernetes/
```
