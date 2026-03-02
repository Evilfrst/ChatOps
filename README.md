# ChatOps
📁 Structure finale du projet

```
devops-chatops-project/
├── app/
│   ├── main.py
│   ├── commands.py
│   ├── requirements.txt
│   └── Dockerfile
├── k8s/
│   ├── deployment.yaml
│   ├── service.yaml
├── .github/
│   └── workflows/
│       └── ci-cd.yaml
├── docker-compose.yml
└── README.md

```

# 🤖 ChatOps DevOps – Chatbot Interne

Projet DevOps démontrant un **chatbot interne pour équipes DevOps** avec **CI/CD + Docker + Kubernetes**.

---

## 🎯 Objectif
Permettre aux équipes techniques de :

- 🚀 Lancer un déploiement
- 📊 Consulter l’état des clusters Kubernetes
- 🚨 Voir les alertes et incidents

Le tout via une API accessible pour l’intégration dans Slack ou autres plateformes collaboratives.

---

## 🏗️ Architecture

```text
Utilisateur (Slack / API Client)
        ↓
Chatbot API (FastAPI)
        ↓
Docker
        ↓
Docker Hub
        ↓
Kubernetes Deployment & Service
        ↓
CI/CD GitHub Actions
```

## 🚀 Technologies utilisées

-**Python / FastAPI** – API chatbot

-**Docker** – Conteneurisation

-**Kubernetes** – Orchestration

-**GitHub Actions** – CI/CD

-**Prometheus / Alertmanager** (simulation pour alertes)

-**Slack API (ou autre plateforme chat)**

## 📋 Fonctionnalités

###Commandes ChatOps :

-/deploy <service> <env> – déclenche un déploiement

-/cluster status – vérifie le cluster

-/alerts – affiche les alertes critiques

###Health checks Kubernetes (liveness / readiness)

###Conteneurisation et déploiement automatique via CI/CD

🚀 Lancer le projet en local

##Cloner le repo
```bash
git clone https://github.com/<TON_USER>/devops-chatops-project.git
cd devops-chatops-project
```
##Lancer avec Docker
```bash
docker-compose up --build
```
API disponible : http://localhost:8000

##Tester une commande :
```bash
-curl -X POST http://localhost:8000/command \
  -H "Content-Type: application/json" \
  -d '{"text":"/cluster status"}'
```
##Lancer sur Kubernetes (local)
```bash
kubectl apply -f k8s/
minikube service chatops-service
```









