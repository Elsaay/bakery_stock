# Bakery Stock Kubernetes Design

## Problem

Deploy the Bakery Stock application on Kubernetes with five services that work together:

1. frontend
2. backend-orders
3. backend-products
4. backend-stock-usage
5. mysql

The goal is not a complex architecture. The goal is a simple deployment that works, is easy to demonstrate, and is easy to explain to a professor.

## Constraints and priorities

- Only the frontend is exposed outside the cluster.
- The three backends and MySQL stay internal to the cluster.
- MySQL data must persist with a persistent volume.
- The solution must include Dockerfiles for the frontend and the three backends.
- The deployment should stay as simple as possible: Kubernetes Deployments, Services, and a small ConfigMap, without Ingress.

## Recommended approach

Use one Docker image per application service and deploy everything on Kubernetes with one Deployment and one Service per service.

MySQL uses the official image, an internal Service, and a PersistentVolumeClaim. The frontend is the only externally exposed service. The three backends are internal ClusterIP services and communicate with MySQL through the Kubernetes service name. A ConfigMap is included to centralize the non-sensitive runtime configuration because it is part of the course material and is easy to explain.

This approach is recommended because it is the simplest one that still satisfies the exercise:

- easy to deploy in Portainer
- easy to explain
- enough separation to justify five services
- persistent database for the demo

## Target architecture

### Services

- `frontend`: user interface, exposed outside the cluster
- `backend-orders`: orders API
- `backend-products`: products API
- `backend-stock-usage`: stock usage API
- `mysql`: relational database shared by the backends

### Kubernetes objects

- `frontend-deployment`
- `backend-orders-deployment`
- `backend-products-deployment`
- `backend-stock-usage-deployment`
- `mysql-deployment`
- `frontend-service`
- `backend-orders-service`
- `backend-products-service`
- `backend-stock-usage-service`
- `mysql-service`
- `mysql-pvc`
- `app-config` ConfigMap

Optional but acceptable if needed:

- a `Secret` for MySQL credentials

## Communication flow

1. The user accesses the frontend.
2. The frontend sends HTTP requests to the three backend services.
3. Each backend runs its own business logic.
4. Each backend reads from or writes to MySQL through `mysql-service`.
5. Responses come back to the frontend and then to the user.

Kubernetes internal DNS provides stable names for communication:

- `backend-orders-service`
- `backend-products-service`
- `backend-stock-usage-service`
- `mysql-service`

The applications do not need fixed IP addresses. They communicate through Kubernetes service names.

The ConfigMap stores the non-sensitive configuration values needed by the applications, such as backend base URLs or MySQL host information. This makes the setup easier to explain because the configuration is separated from the container images.

## Docker scope

The complete solution includes:

- one Dockerfile for the frontend
- one Dockerfile for `backend-orders`
- one Dockerfile for `backend-products`
- one Dockerfile for `backend-stock-usage`

MySQL uses the official `mysql` image and Kubernetes configuration for runtime setup and persistence.

## Persistence

MySQL storage must survive pod restarts. A PersistentVolumeClaim is therefore required.

This keeps the database state available for demonstration and allows the system to be explained simply:

- application containers can restart
- MySQL data remains available
- Kubernetes reattaches the persistent storage

## Failure model

The system does not need production-grade resilience. It only needs to work clearly for the exercise.

Acceptable behavior:

- if a backend restarts, Kubernetes recreates it
- if MySQL is temporarily unavailable, backend requests can fail until MySQL is reachable again
- once all pods are healthy, the frontend should be able to use the three backends normally

## Demo and explanation points

The final demo should make the following points easy to show:

1. Five services are deployed on Kubernetes.
2. Only the frontend is exposed outside the cluster.
3. The frontend communicates with the three backend microservices.
4. The backends use MySQL as their database.
5. MySQL keeps its data through persistent storage.

## What to say to the professor

Short explanation:

> Docker packages each application into an image.
> Kubernetes runs the images in pods.
> Services give stable network names so the microservices can communicate.
> A ConfigMap stores shared non-sensitive configuration outside the images.
> The frontend is the only public entry point.
> The three backends stay internal and use MySQL.
> A persistent volume keeps the database data after restarts.

## Out of scope

The following are intentionally excluded to keep the project simple:

- Ingress
- domain names
- autoscaling
- multiple replicas for high availability
- advanced observability
- production hardening
