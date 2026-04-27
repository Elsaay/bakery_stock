# Kubernetes Explanation Document Design

## Problem

The project already has an operational deployment guide in `kubernetes/README.md`, but it does not fully explain the Kubernetes concepts behind the workflow or prepare the user to answer oral questions from a professor.

The new document must therefore explain both:

1. Kubernetes concepts in general
2. how those concepts are applied concretely in the Bakery Stock project

The result should make it easy to understand the deployment workflow and to answer likely professor questions during a demonstration or review.

## Target file

- `kubernetes/EXPLICATION.md`

## Audience and tone

- primary audience: student preparing to present the project to a professor
- tone: formal written documentation, but still readable and pedagogical
- language: French

## Scope

The document must cover both:

1. general Kubernetes concepts
2. the real workflow and architecture used in this repository

This includes:

- what a YAML manifest is
- what a pod is
- what a service is
- why services are needed
- what a Deployment does
- what a ConfigMap does
- what a Secret does
- what a PVC does
- what rollout means
- how Nginx is used in the frontend image
- why the frontend uses `/api`
- how Docker images are built and pushed
- how the application is deployed on Kubernetes
- how to explain this design choice to a professor

## Recommended structure

### 1. Project goal

Briefly explain what Bakery Stock is and what is deployed:

- frontend
- backend-products
- backend-orders
- backend-stock-usage
- mysql

### 2. Architecture overview

Explain the high-level architecture in simple terms:

- only the frontend is exposed
- backends are internal
- MySQL is internal and persistent
- Nginx in the frontend proxies `/api/*`

### 3. Core Kubernetes concepts

Explain the following concepts in simple but correct terms:

- image
- container
- pod
- deployment
- service
- ConfigMap
- Secret
- PersistentVolumeClaim
- manifest YAML

For each concept, give:

- a short definition
- its role in general
- its role in Bakery Stock

### 4. Concrete workflow in this project

Describe the full workflow:

1. build Docker images
2. push images to Docker Hub
3. apply Kubernetes manifests
4. rollout the deployments
5. check pods, services, and pvc
6. access the frontend

Explain what happens technically at each step.

### 5. Frontend and Nginx explanation

Explain clearly:

- why the frontend does not call backend service names directly from the browser
- why `/api` is used in the frontend build
- where the Nginx configuration is
- how Nginx forwards requests to Kubernetes services
- why exact path and slash path are both handled in `nginx.conf`

### 6. Why these Kubernetes objects were needed

Add short explanatory subsections such as:

- why we needed manifests
- why we needed Services
- why we needed a Deployment per service
- why we needed a Secret for MySQL credentials
- why we needed a PVC for MySQL

### 7. Likely professor questions

Add a question/answer section with short, oral-friendly answers, for example:

- What is a manifest YAML?
- What is the difference between a pod and a service?
- Why is only the frontend exposed?
- Why do we use `/api` in the frontend?
- Why do we need Nginx?
- Why do we use a ConfigMap?
- Why do we use a Secret?
- Why do we use a PVC?
- What is rollout?
- What happens if a pod crashes?

### 8. Short oral summary

End with a short paragraph that can be reused almost directly when presenting the project orally.

## Constraints

- the document must stay aligned with the files that currently exist in the repository
- the explanations must remain simple enough for a course project
- avoid production-grade concepts that are not used here
- avoid unnecessary theory unrelated to this project

## Out of scope

Do not turn this document into:

- a pure command cheat sheet
- a production Kubernetes handbook
- a generic Docker tutorial

Those topics should be mentioned only when they help explain this exact project.
