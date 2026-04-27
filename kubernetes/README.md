# Kubernetes deployment guide

Run the commands below from the repository root.

## 1. Build the images

```bash
docker build \
  -f kubernetes/dockerfiles/front.Dockerfile \
  -t yannisal/myrepo:frontend \
  --build-arg REACT_APP_PRODUCTS_URL=/api \
  --build-arg REACT_APP_ORDERS_URL=/api \
  --build-arg REACT_APP_STOCK_URL=/api \
  .

docker build -f kubernetes/dockerfiles/products.Dockerfile -t yannisal/myrepo:products .
docker build -f kubernetes/dockerfiles/orders.Dockerfile -t yannisal/myrepo:orders .
docker build -f kubernetes/dockerfiles/stock.Dockerfile -t yannisal/myrepo:stock-usage .
```

## 2. Push the images to Docker Hub

```bash
docker login

docker push yannisal/myrepo:frontend
docker push yannisal/myrepo:products
docker push yannisal/myrepo:orders
docker push yannisal/myrepo:stock-usage
```

## 3. Apply the Kubernetes manifests

Apply the resources in this order so config, secrets, MySQL, deployments, and services are created consistently:

```bash
kubectl apply -f kubernetes/config/configmap.yaml
kubectl apply -f kubernetes/config/secrets.yaml
kubectl apply -f kubernetes/mysql/init-configmap.yaml
kubectl apply -f kubernetes/deployments/mysql-deployment.yaml
kubectl apply -f kubernetes/deployments/products-deployment.yaml
kubectl apply -f kubernetes/deployments/orders-deployment.yaml
kubectl apply -f kubernetes/deployments/stock-deployment.yaml
kubectl apply -f kubernetes/deployments/front-deployment.yaml
kubectl apply -f kubernetes/services/all-services.yaml
```

## 4. Check the success
Go on portainer and check the Application list


## 5. Fallback debugging

If one deployment does not become ready, inspect its logs on portainer :

```bash
Applications -> select an application -> logs
```

## 6. Access the frontend

Check the frontend service first:

Access the frontend from the cluster IP for exemple : 192.168.194.176

