# Product Catalog Platform
A cloud-native product catalog app — **React + Flask + PostgreSQL** — containerized with Docker, deployed on **Kubernetes (Kind)**, and shipped through a **Jenkins CI/CD pipeline**. Includes NGINX Ingress, Network Policies, and a Prometheus/Grafana/Loki monitoring stack.
<img width="1462" height="776" alt="App-screenshot" src="https://github.com/user-attachments/assets/7a90f5b1-683f-4eb3-be41-da9a5f0b164c" />

---
## 🚀 Features
- React frontend served with NGINX 
- Flask REST API backend
- PostgreSQL database with persistent storage
- Dockerized frontend and backend (multi-stage builds)
- Kubernetes Deployments, Services, Ingress, ConfigMaps, Secrets, PVC
- Kubernetes Network Policies (default-deny with explicit allow rules)
- Jenkins CI/CD Pipeline (build → push → validate)
- Docker Hub Image Publishing
- Prometheus Monitoring
- Grafana Dashboards
- Loki + Promtail Centralized Logging
- Health Checks (Liveness & Readiness Probes)

---

### 1. Clone the repo
 
```bash
git clone https://github.com/anusree-ux/product-catalog-app.git
cd product-catalog-app
```
 
### 2. Set up environment variables
 
```bash
mkdir -p environments/local
cp .env.example environments/local/.env
```
### 3. Run locally with Docker Compose
 
```bash
./deploy.sh start     # build and start everything
./deploy.sh status    # check container status
./deploy.sh stop      # stop everything
./deploy.sh restart   # rebuild and restart
```
 
The app will be available at **http://localhost:5173**.

## Deploying to Kubernetes (Kind)
 
```bash
./scripts/bootstrap-kind.sh
```
 
Verify the deployment:
 
```bash
kubectl get pods -n product-catalog
kubectl get svc -n product-catalog
kubectl get ingress -n product-catalog
```
Access the application:

```
http://product-catalog.local
```
add it to your `/etc/hosts` pointing at the Kind cluster's ingress IP.

---

# 🏗️ Architecture
```text
                 Developer
                     │
                git push
                     │
             GitHub Repository
                     │
             Jenkins Pipeline
                     │
        ┌────────────┼────────────┐
        │            │            │
 Build Backend  Build Frontend    │
   Image           Image          │
        │            │            │
        └────────────┴────────────┘
                     │
          Push Images to Docker Hub
                     │
          Validate K8s Manifests
                     │
          Deploy to Kubernetes
                     │
              Kind Cluster
                     │
             NGINX Ingress
                     │
        ┌────────────┴────────────┐
        │                         │
  Frontend Pod  ──────────►  Backend Pod
                                   │
                                   ▼
                            PostgreSQL Pod
        ─────────────────────────────
      Prometheus ───► Grafana
           ▲              ▲
           │              │
      Promtail ───► Loki
```
---

# 🛠️ Tech Stack
| Category | Technologies |
|----------|--------------|
| Frontend | React, Vite, NGINX |
| Backend | Flask, SQLAlchemy |
| Database | PostgreSQL |
| Containers | Docker |
| Container Orchestration | Kubernetes (Kind) |
| CI/CD | Jenkins |
| Monitoring | Prometheus |
| Visualization | Grafana |
| Logging | Loki, Promtail |
| Security | Kubernetes Network Policies, Trivy |

---

# ☸️ Kubernetes Resources
The application is deployed using the following Kubernetes resources:

- Namespace
- Deployments
- Services
- Ingress
- ConfigMaps
- Secrets
- Persistent Volume Claim (PVC)
- Network Policies
<img width="1163" height="590" alt="Kubernetes" src="https://github.com/user-attachments/assets/e36983d9-c4d0-4f88-8487-f6f767c08e48" />

---

# 📊 Monitoring
Monitoring is implemented using:
- Prometheus
- Grafana
- kube-state-metrics
- Node Exporter

Monitored metrics include:
- CPU Usage
- Memory Usage
- Pod Status
- Kubernetes Cluster Health
- Application Metrics
<img width="1912" height="905" alt="Grafana-Dashboard" src="https://github.com/user-attachments/assets/04af4f60-20ae-485f-92c4-151a83840418" />
<img width="1886" height="960" alt="Promethus-Targets" src="https://github.com/user-attachments/assets/7910299c-948d-4c06-a2df-8ddbfae33517" />

---

# 📝 Centralized Logging
The logging stack consists of:

- Promtail
- Loki
- Grafana

Logs from Kubernetes pods are collected by Promtail, stored in Loki, and visualized using Grafana.
<img width="1910" height="903" alt="LOKI" src="https://github.com/user-attachments/assets/6ce7e6cb-40f2-4642-a4f8-6dba99805b7f" />

---

# 🔄 Jenkins CI/CD Pipeline
The Jenkins pipeline automates the entire deployment process.

Pipeline stages:
1. Checkout source code
2. Wait for the Docker daemon (dind sidecar) to be ready
3. Build backend Docker image
4. Build frontend Docker image
5. Push both images to Docker Hub (tagged with the build number)
6. Validate Kubernetes manifests (kubectl apply --dry-run=client -k k8s/base)
7. Deploy to Kubernetes (kubectl set image for backend & frontend)
8. Wait for rollout to complete (kubectl rollout status)
9. Verify deployment (list pods, deployments, and services)
<img width="1882" height="895" alt="Jenkins- Stage" src="https://github.com/user-attachments/assets/90a963b7-d25b-480c-84a9-0ddeb6f10c3c" />
<img width="1906" height="775" alt="DockerHub" src="https://github.com/user-attachments/assets/a936b38d-3c03-4043-af0b-ef7b5fb60074" />

---
# 📄 License
This project is intended for learning and portfolio purposes.
