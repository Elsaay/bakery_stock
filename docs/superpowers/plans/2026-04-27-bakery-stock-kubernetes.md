# Bakery Stock Kubernetes Implementation Plan

> **For agentic workers:** This plan is intentionally adapted for Docker and Kubernetes configuration work. Do not force a TDD workflow here. Validate with image builds, manifest checks, rollout checks, and a final human functional review after deployment.

**Goal:** Package the Bakery Stock frontend and the three backends as Docker images, deploy them on Kubernetes with MySQL persistence, and expose only the frontend.

**Architecture:** Create a new `kubernetes/` directory that contains Dockerfiles, Nginx configuration, Kubernetes manifests, and a deployment guide. The frontend serves the React build through Nginx and proxies `/api/*` to the internal services, while the three backends connect to MySQL through Kubernetes service discovery and shared environment variables.

**Tech Stack:** React (CRA), Express, MySQL 8, Docker, Nginx, Kubernetes Deployments/Services/ConfigMap/Secret/PersistentVolumeClaim, `kubectl`, Docker Hub (`yannisal/*`)

---

## Delivery rules for this plan

- No dedicated worktree is required.
- No TDD workflow is required.
- No artificial automated tests need to be invented for YAML or Docker configuration.
- Technical validation is limited to:
  - `docker build`
  - `kubectl apply`
  - `kubectl rollout status`
  - `kubectl get pods,svc,pvc`
  - log inspection if a pod fails
- Functional validation is done manually by the project owner after deployment.

## File map

### Existing files to modify

- `frontend/src/api/index.js` - remove localhost fallback URLs and require explicit frontend API base URLs provided during the frontend build

### New files to create

- `.dockerignore`
- `kubernetes/dockerfiles/front.Dockerfile`
- `kubernetes/dockerfiles/nginx.conf`
- `kubernetes/dockerfiles/products.Dockerfile`
- `kubernetes/dockerfiles/orders.Dockerfile`
- `kubernetes/dockerfiles/stock.Dockerfile`
- `kubernetes/config/configmap.yaml`
- `kubernetes/config/secrets.yaml`
- `kubernetes/mysql/init.sql`
- `kubernetes/mysql/init-configmap.yaml`
- `kubernetes/deployments/mysql-deployment.yaml`
- `kubernetes/deployments/products-deployment.yaml`
- `kubernetes/deployments/orders-deployment.yaml`
- `kubernetes/deployments/stock-deployment.yaml`
- `kubernetes/deployments/front-deployment.yaml`
- `kubernetes/services/all-services.yaml`
- `kubernetes/README.md`

## Target images

- `yannisal/bakery-stock-frontend:latest`
- `yannisal/bakery-stock-products:latest`
- `yannisal/bakery-stock-orders:latest`
- `yannisal/bakery-stock-stock-usage:latest`

## Task 1: Make the frontend compatible with a Kubernetes reverse proxy

**Files:**
- Modify: `frontend/src/api/index.js`

- [ ] **Step 1: Remove the localhost fallback API base URLs**

Update `frontend/src/api/index.js` so each API client uses only the injected `REACT_APP_*_URL` value and no localhost fallback:

```javascript
import axios from 'axios';

const productsApi = axios.create({
  baseURL: process.env.REACT_APP_PRODUCTS_URL,
  headers: { 'Content-Type': 'application/json' },
});

const ordersApi = axios.create({
  baseURL: process.env.REACT_APP_ORDERS_URL,
  headers: { 'Content-Type': 'application/json' },
});

const stockApi = axios.create({
  baseURL: process.env.REACT_APP_STOCK_URL,
  headers: { 'Content-Type': 'application/json' },
});

export const getProducts = () => productsApi.get('/products');
export const createProduct = (data) => productsApi.post('/products', data);
export const updateProduct = (id, data) => productsApi.put(`/products/${id}`, data);
export const deleteProduct = (id) => productsApi.delete(`/products/${id}`);

export const getOrders = () => ordersApi.get('/orders');
export const createOrder = (data) => ordersApi.post('/orders', data);

export const recordDailyReport = (items) => stockApi.post('/stock-usage', items);

export default productsApi;
```

- [ ] **Step 2: Build the frontend once to catch syntax errors**

Run:

```bash
cd frontend
npm install
npm run build
```

Expected: the React production build completes and produces `frontend/build/`.

## Task 2: Create the frontend container and reverse proxy

**Files:**
- Create: `kubernetes/dockerfiles/front.Dockerfile`
- Create: `kubernetes/dockerfiles/nginx.conf`

- [ ] **Step 1: Create the frontend Dockerfile**

Create `kubernetes/dockerfiles/front.Dockerfile`:

```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

COPY frontend/package*.json ./
RUN npm install

ARG REACT_APP_PRODUCTS_URL
ARG REACT_APP_ORDERS_URL
ARG REACT_APP_STOCK_URL

RUN test -n "$REACT_APP_PRODUCTS_URL" \
 && test -n "$REACT_APP_ORDERS_URL" \
 && test -n "$REACT_APP_STOCK_URL"

ENV REACT_APP_PRODUCTS_URL=$REACT_APP_PRODUCTS_URL
ENV REACT_APP_ORDERS_URL=$REACT_APP_ORDERS_URL
ENV REACT_APP_STOCK_URL=$REACT_APP_STOCK_URL

COPY frontend/ ./
RUN npm run build

FROM nginx:1.27-alpine

COPY kubernetes/dockerfiles/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/build /usr/share/nginx/html

EXPOSE 80
```

- [ ] **Step 2: Create the Nginx proxy configuration**

Create `kubernetes/dockerfiles/nginx.conf`:

```nginx
server {
  listen 80;
  server_name _;

  root /usr/share/nginx/html;
  index index.html;

  location / {
    try_files $uri /index.html;
  }

  location = /api/products {
    proxy_pass http://backend-products-service:5001/products;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }

  location /api/products/ {
    proxy_pass http://backend-products-service:5001/products/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }

  location = /api/orders {
    proxy_pass http://backend-orders-service:5002/orders;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }

  location /api/orders/ {
    proxy_pass http://backend-orders-service:5002/orders/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }

  location = /api/stock-usage {
    proxy_pass http://backend-stock-usage-service:5003/stock-usage;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }

  location /api/stock-usage/ {
    proxy_pass http://backend-stock-usage-service:5003/stock-usage/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }
}
```

- [ ] **Step 3: Build the frontend image**

Run:

```bash
docker build \
  -f kubernetes/dockerfiles/front.Dockerfile \
  -t yannisal/bakery-stock-frontend:latest \
  --build-arg REACT_APP_PRODUCTS_URL=/api \
  --build-arg REACT_APP_ORDERS_URL=/api \
  --build-arg REACT_APP_STOCK_URL=/api \
  .
```

Expected: the image builds successfully.

## Task 3: Create the three backend Docker images

**Files:**
- Create: `.dockerignore`
- Create: `kubernetes/dockerfiles/products.Dockerfile`
- Create: `kubernetes/dockerfiles/orders.Dockerfile`
- Create: `kubernetes/dockerfiles/stock.Dockerfile`

- [ ] **Step 1: Create a root `.dockerignore`**

Create `.dockerignore`:

```dockerignore
**/node_modules
**/.env
**/.env.*
**/*.log
**/logs
**/pids
**/.npm
**/.eslintcache
**/.node_repl_history
frontend/build
```

- [ ] **Step 2: Create `kubernetes/dockerfiles/products.Dockerfile`**

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY backend-products/package*.json ./
RUN npm install --omit=dev

COPY backend-products/ ./

EXPOSE 5001

CMD ["node", "src/server.js"]
```

- [ ] **Step 3: Create `kubernetes/dockerfiles/orders.Dockerfile`**

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY backend-orders/package*.json ./
RUN npm install --omit=dev

COPY backend-orders/ ./

EXPOSE 5002

CMD ["node", "src/server.js"]
```

- [ ] **Step 4: Create `kubernetes/dockerfiles/stock.Dockerfile`**

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY backend-stock-usage/package*.json ./
RUN npm install --omit=dev

COPY backend-stock-usage/ ./

EXPOSE 5003

CMD ["node", "src/server.js"]
```

- [ ] **Step 5: Build the backend images**

Run:

```bash
docker build -f kubernetes/dockerfiles/products.Dockerfile -t yannisal/bakery-stock-products:latest .
docker build -f kubernetes/dockerfiles/orders.Dockerfile -t yannisal/bakery-stock-orders:latest .
docker build -f kubernetes/dockerfiles/stock.Dockerfile -t yannisal/bakery-stock-stock-usage:latest .
```

Expected: all three images build successfully.

## Task 4: Create the Kubernetes configuration for MySQL and shared app settings

**Files:**
- Create: `kubernetes/config/configmap.yaml`
- Create: `kubernetes/config/secrets.yaml`
- Create: `kubernetes/mysql/init.sql`
- Create: `kubernetes/mysql/init-configmap.yaml`
- Create: `kubernetes/deployments/mysql-deployment.yaml`

- [ ] **Step 1: Create the shared ConfigMap**

Create `kubernetes/config/configmap.yaml` with the shared non-sensitive values:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  DB_HOST: mysql-service
  DB_NAME: bakery_stock
```

- [ ] **Step 2: Create the MySQL Secret**

Create `kubernetes/config/secrets.yaml`:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: mysql-secret
type: Opaque
stringData:
  DB_USER: bakery_user
  DB_PASSWORD: bakery_password
  MYSQL_ROOT_PASSWORD: root_password
```

- [ ] **Step 3: Create the SQL bootstrap file**

Create `kubernetes/mysql/init.sql` with the tables referenced by the controllers:

```sql
CREATE DATABASE IF NOT EXISTS bakery_stock;
USE bakery_stock;

CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  image VARCHAR(255) NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  status ENUM('available', 'unavailable') NOT NULL DEFAULT 'available'
);

CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  supplier_email VARCHAR(255) NOT NULL,
  message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  CONSTRAINT fk_order_items_order
    FOREIGN KEY (order_id) REFERENCES orders(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_order_items_product
    FOREIGN KEY (product_id) REFERENCES products(id)
    ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS stock_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  quantity_used INT NOT NULL,
  used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_stock_history_product
    FOREIGN KEY (product_id) REFERENCES products(id)
    ON DELETE RESTRICT
);

INSERT INTO products (name, image, stock, status) VALUES
  ('Baguette', 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73', 20, 'available'),
  ('Croissant', 'https://images.unsplash.com/photo-1509440159596-0249088772ff', 15, 'available'),
  ('Pain au chocolat', 'https://images.unsplash.com/photo-1517433670267-08bbd4be890f', 0, 'unavailable');
```

- [ ] **Step 4: Create the SQL init ConfigMap**

Create `kubernetes/mysql/init-configmap.yaml`:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: mysql-init-script
data:
  init.sql: |
```

Then indent the full content of `kubernetes/mysql/init.sql` under `init.sql: |`.

- [ ] **Step 5: Create the MySQL PVC, Deployment, and Service**

Create `kubernetes/deployments/mysql-deployment.yaml`:

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: mysql-pvc
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 1Gi
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mysql-deployment
spec:
  replicas: 1
  strategy:
    type: Recreate
  selector:
    matchLabels:
      app: mysql
  template:
    metadata:
      labels:
        app: mysql
    spec:
      containers:
        - name: mysql
          image: mysql:8.0
          ports:
            - containerPort: 3306
          env:
            - name: MYSQL_DATABASE
              valueFrom:
                configMapKeyRef:
                  name: app-config
                  key: DB_NAME
            - name: MYSQL_USER
              valueFrom:
                secretKeyRef:
                  name: mysql-secret
                  key: DB_USER
            - name: MYSQL_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: mysql-secret
                  key: DB_PASSWORD
            - name: MYSQL_ROOT_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: mysql-secret
                  key: MYSQL_ROOT_PASSWORD
          volumeMounts:
            - name: mysql-data
              mountPath: /var/lib/mysql
            - name: mysql-init
              mountPath: /docker-entrypoint-initdb.d/init.sql
              subPath: init.sql
          # Schema bootstrap files in /docker-entrypoint-initdb.d run only when MySQL
          # initializes a fresh data directory. Recreate the PVC or run a manual
          # migration before expecting schema changes to apply to an existing volume.
      volumes:
        - name: mysql-data
          persistentVolumeClaim:
            claimName: mysql-pvc
        - name: mysql-init
          configMap:
            name: mysql-init-script
---
apiVersion: v1
kind: Service
metadata:
  name: mysql-service
spec:
  selector:
    app: mysql
  ports:
    - port: 3306
      targetPort: 3306
```

## Task 5: Create the Kubernetes deployments for the three backends and the frontend

**Files:**
- Create: `kubernetes/deployments/products-deployment.yaml`
- Create: `kubernetes/deployments/orders-deployment.yaml`
- Create: `kubernetes/deployments/stock-deployment.yaml`
- Create: `kubernetes/deployments/front-deployment.yaml`
- Create: `kubernetes/services/all-services.yaml`

- [ ] **Step 1: Create the products deployment**

Create `kubernetes/deployments/products-deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: products-deployment
spec:
  replicas: 1
  selector:
    matchLabels:
      app: backend-products
  template:
    metadata:
      labels:
        app: backend-products
    spec:
      containers:
        - name: backend-products
          image: yannisal/bakery-stock-products:latest
          ports:
            - containerPort: 5001
          env:
            - name: DB_HOST
              valueFrom:
                configMapKeyRef:
                  name: app-config
                  key: DB_HOST
            - name: DB_NAME
              valueFrom:
                configMapKeyRef:
                  name: app-config
                  key: DB_NAME
            - name: DB_USER
              valueFrom:
                secretKeyRef:
                  name: mysql-secret
                  key: DB_USER
            - name: DB_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: mysql-secret
                  key: DB_PASSWORD
```

- [ ] **Step 2: Create the orders deployment**

Create `kubernetes/deployments/orders-deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: orders-deployment
spec:
  replicas: 1
  selector:
    matchLabels:
      app: backend-orders
  template:
    metadata:
      labels:
        app: backend-orders
    spec:
      containers:
        - name: backend-orders
          image: yannisal/bakery-stock-orders:latest
          ports:
            - containerPort: 5002
          env:
            - name: DB_HOST
              valueFrom:
                configMapKeyRef:
                  name: app-config
                  key: DB_HOST
            - name: DB_NAME
              valueFrom:
                configMapKeyRef:
                  name: app-config
                  key: DB_NAME
            - name: DB_USER
              valueFrom:
                secretKeyRef:
                  name: mysql-secret
                  key: DB_USER
            - name: DB_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: mysql-secret
                  key: DB_PASSWORD
```

- [ ] **Step 3: Create the stock usage deployment**

Create `kubernetes/deployments/stock-deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: stock-deployment
spec:
  replicas: 1
  selector:
    matchLabels:
      app: backend-stock-usage
  template:
    metadata:
      labels:
        app: backend-stock-usage
    spec:
      containers:
        - name: backend-stock-usage
          image: yannisal/bakery-stock-stock-usage:latest
          ports:
            - containerPort: 5003
          env:
            - name: DB_HOST
              valueFrom:
                configMapKeyRef:
                  name: app-config
                  key: DB_HOST
            - name: DB_NAME
              valueFrom:
                configMapKeyRef:
                  name: app-config
                  key: DB_NAME
            - name: DB_USER
              valueFrom:
                secretKeyRef:
                  name: mysql-secret
                  key: DB_USER
            - name: DB_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: mysql-secret
                  key: DB_PASSWORD
```

- [ ] **Step 4: Create the frontend deployment**

Create `kubernetes/deployments/front-deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: front-deployment
spec:
  replicas: 1
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
        - name: frontend
          image: yannisal/bakery-stock-frontend:latest
          ports:
            - containerPort: 80
```

- [ ] **Step 5: Create the services manifest**

Create `kubernetes/services/all-services.yaml`:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: frontend-service
spec:
  type: NodePort
  selector:
    app: frontend
  ports:
    - port: 80
      targetPort: 80
      nodePort: 30080
---
apiVersion: v1
kind: Service
metadata:
  name: backend-products-service
spec:
  selector:
    app: backend-products
  ports:
    - port: 5001
      targetPort: 5001
---
apiVersion: v1
kind: Service
metadata:
  name: backend-orders-service
spec:
  selector:
    app: backend-orders
  ports:
    - port: 5002
      targetPort: 5002
---
apiVersion: v1
kind: Service
metadata:
  name: backend-stock-usage-service
spec:
  selector:
    app: backend-stock-usage
  ports:
    - port: 5003
      targetPort: 5003
```

## Task 6: Write the deployment guide and deployment commands

**Files:**
- Create: `kubernetes/README.md`

- [ ] **Step 1: Document the Docker Hub login and push flow**

Include these commands in `kubernetes/README.md`:

```bash
docker login

docker push yannisal/bakery-stock-frontend:latest
docker push yannisal/bakery-stock-products:latest
docker push yannisal/bakery-stock-orders:latest
docker push yannisal/bakery-stock-stock-usage:latest
```

- [ ] **Step 2: Document the Kubernetes apply flow**

Include these commands in `kubernetes/README.md`:

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

- [ ] **Step 3: Document the rollout checks**

Include these commands in `kubernetes/README.md`:

```bash
kubectl rollout status deployment/mysql-deployment
kubectl rollout status deployment/products-deployment
kubectl rollout status deployment/orders-deployment
kubectl rollout status deployment/stock-deployment
kubectl rollout status deployment/front-deployment

kubectl get pods
kubectl get svc
kubectl get pvc
```

- [ ] **Step 4: Document the fallback debugging commands**

Include these commands in `kubernetes/README.md`:

```bash
kubectl logs deployment/mysql-deployment
kubectl logs deployment/products-deployment
kubectl logs deployment/orders-deployment
kubectl logs deployment/stock-deployment
kubectl logs deployment/front-deployment
```

- [ ] **Step 5: Document manual access options**

Document both access methods:

```bash
kubectl get svc frontend-service
```

and, if the NodePort is not directly reachable from the workstation:

```bash
kubectl port-forward svc/frontend-service 8080:80
```

Then open:

- `http://localhost:8080` when using `port-forward`
- or the NodePort URL returned by `kubectl get svc frontend-service`

## Task 7: Final technical validation and human acceptance

**Files:**
- No new files

- [ ] **Step 1: Rebuild all four images one last time**

Run:

```bash
docker build -f kubernetes/dockerfiles/front.Dockerfile -t yannisal/bakery-stock-frontend:latest .
docker build -f kubernetes/dockerfiles/products.Dockerfile -t yannisal/bakery-stock-products:latest .
docker build -f kubernetes/dockerfiles/orders.Dockerfile -t yannisal/bakery-stock-orders:latest .
docker build -f kubernetes/dockerfiles/stock.Dockerfile -t yannisal/bakery-stock-stock-usage:latest .
```

- [ ] **Step 2: Apply the full stack to Kubernetes**

Run:

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

- [ ] **Step 3: Wait for every deployment to become ready**

Run:

```bash
kubectl rollout status deployment/mysql-deployment
kubectl rollout status deployment/products-deployment
kubectl rollout status deployment/orders-deployment
kubectl rollout status deployment/stock-deployment
kubectl rollout status deployment/front-deployment
```

- [ ] **Step 4: Perform the minimum infrastructure checks**

Run:

```bash
kubectl get pods
kubectl get svc
kubectl get pvc
```

Expected:

- all pods are `Running` or `Completed`
- the frontend service exists and is externally reachable through NodePort or `port-forward`
- the three backend services exist as internal `ClusterIP` services
- the PVC is `Bound`

- [ ] **Step 5: Hand over to human functional validation**

Manual validation checklist for the project owner:

1. Open the frontend in a browser.
2. Confirm the product list loads.
3. Confirm a product can be added, updated, and deleted.
4. Confirm an order can be created.
5. Confirm the stock usage endpoint works from the UI flow that depends on it.
6. Restart a pod and confirm the application comes back.
7. Confirm MySQL data persists after the MySQL pod restarts.

## Notes and implementation decisions

- Keep the manifests simple: one Deployment per service, one Service per service, one PVC for MySQL.
- Do not add Ingress, autoscaling, health probes, or multi-replica production hardening unless the course requirement changes.
- Prefer `kubectl` as the reference deployment workflow.
- If a deployment fails, inspect logs and fix the manifest or container configuration before retrying.
