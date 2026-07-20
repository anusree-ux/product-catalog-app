#!/bin/bash

set -e

CLUSTER_NAME="product-catalog"

echo "================================="
echo "Creating Kind Cluster"
echo "================================="

if kind get clusters | grep -q $CLUSTER_NAME
then
    echo "Cluster already exists"
else
    kind create cluster \
    --name $CLUSTER_NAME \
    --config kind-config.yaml
fi


echo "================================="
echo "Installing Ingress Controller"
echo "================================="

helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx || true
helm repo update

helm upgrade --install ingress-nginx \
  ingress-nginx/ingress-nginx \
  --namespace ingress-nginx \
  --create-namespace \
  --set controller.hostPort.enabled=true \
  --set controller.hostPort.ports.http=80 \
  --set controller.hostPort.ports.https=443 \
  --set controller.service.type=NodePort \
  --set controller.kind=DaemonSet

echo "Waiting for ingress controller..."

kubectl rollout status \
  daemonset/ingress-nginx-controller \
  -n ingress-nginx \
  --timeout=300s


echo "================================="
echo "Installing Monitoring"
echo "================================="


helm repo add prometheus-community \
https://prometheus-community.github.io/helm-charts || true


helm repo add grafana \
https://grafana.github.io/helm-charts || true


helm repo update



echo "Installing Prometheus Stack..."

helm upgrade --install kube-prometheus-stack \
prometheus-community/kube-prometheus-stack \
--namespace monitoring \
--create-namespace



echo "Waiting for Monitoring Stack..."

kubectl wait \
--for=condition=Ready pod \
-n monitoring \
-l app.kubernetes.io/instance=kube-prometheus-stack \
--timeout=900s



echo "================================="
echo "Installing Loki"
echo "================================="


helm upgrade --install loki \
grafana/loki \
--namespace monitoring \
--create-namespace \
-f helm/charts/loki/values.yaml \
|| echo "Loki installation issue, continuing..."



echo "================================="
echo "Installing Promtail"
echo "================================="


helm upgrade --install promtail \
grafana/promtail \
--namespace monitoring \
-f helm/charts/promtail/values.yaml \
|| echo "Promtail installation issue, continuing..."



echo "================================="
echo "Waiting for Logging Stack"
echo "================================="


echo "Waiting for Loki..."

kubectl rollout status \
statefulset/loki \
-n monitoring \
--timeout=900s \
|| echo "Loki not ready yet"



echo "Waiting for Promtail..."

kubectl rollout status \
daemonset/promtail \
-n monitoring \
--timeout=900s \
|| echo "Promtail not ready yet"



echo "================================="
echo "Building Docker Images"
echo "================================="


docker build \
-t product-backend:1.0 \
./backend


docker build \
-t product-frontend:1.0 \
./frontend



echo "================================="
echo "Loading Images into Kind"
echo "================================="


kind load docker-image \
product-backend:1.0 \
--name $CLUSTER_NAME


kind load docker-image \
product-frontend:1.0 \
--name $CLUSTER_NAME



echo "================================="
echo "Deploying Application"
echo "================================="


kubectl apply -k k8s/base



echo "================================="
echo "Waiting for Application"
echo "================================="


kubectl rollout status \
deployment/postgres \
-n product-catalog \
--timeout=300s


kubectl rollout status \
deployment/backend \
-n product-catalog \
--timeout=300s


kubectl rollout status \
deployment/frontend \
-n product-catalog \
--timeout=300s



echo "================================="
echo "Validation"
echo "================================="


echo "Monitoring Pods:"
kubectl get pods -n monitoring


echo ""

echo "Application Pods:"
kubectl get pods -n product-catalog


echo ""

echo "Ingress:"
kubectl get ingress -n product-catalog



echo "================================="
echo "Deployment Completed"
echo "================================="
