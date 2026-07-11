#!/bin/bash

set -e

CLUSTER_NAME="product-catalog"

echo "================================="
echo "Creating Kind Cluster"
echo "================================="

if kind get clusters | grep -q "$CLUSTER_NAME"; then
    echo "Kind cluster already exists"
else
    kind create cluster \
    --name $CLUSTER_NAME \
    --config kind-config.yaml
fi


echo "================================="
echo "Installing Ingress Nginx"
echo "================================="

helm repo add ingress-nginx \
https://kubernetes.github.io/ingress-nginx || true

helm repo update


helm upgrade --install ingress-nginx \
ingress-nginx/ingress-nginx \
--namespace ingress-nginx \
--create-namespace \
-f helm/charts/ingress-nginx/values.yaml


echo "Waiting for ingress controller..."

kubectl wait \
--namespace ingress-nginx \
--for=condition=available \
deployment/ingress-nginx-controller \
--timeout=180s



echo "================================="
echo "Installing Monitoring Stack"
echo "================================="


helm repo add prometheus-community \
https://prometheus-community.github.io/helm-charts || true


helm repo update


helm upgrade --install kube-prometheus-stack \
prometheus-community/kube-prometheus-stack \
--namespace monitoring \
--create-namespace \
-f helm/charts/kube-prometheus-stack/values.yaml



echo "Waiting for monitoring..."

kubectl wait \
--namespace monitoring \
--for=condition=available \
deployment/kube-prometheus-stack-grafana \
--timeout=300s



echo "================================="
echo "Installing Loki"
echo "================================="


helm repo add grafana \
https://grafana.github.io/helm-charts || true


helm repo update


helm upgrade --install loki \
grafana/loki \
--namespace monitoring \
-f helm/charts/loki/values.yaml



echo "================================="
echo "Installing Promtail"
echo "================================="


helm upgrade --install promtail \
grafana/promtail \
--namespace monitoring \
-f helm/charts/promtail/values.yaml



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


kubectl apply -k k8s/overlays/dev



echo "================================="
echo "Waiting for PostgreSQL"
echo "================================="


kubectl rollout status \
deployment/postgres \
-n product-catalog \
--timeout=180s



echo "================================="
echo "Waiting for Backend"
echo "================================="


kubectl rollout status \
deployment/backend \
-n product-catalog \
--timeout=180s



echo "================================="
echo "Waiting for Frontend"
echo "================================="


kubectl rollout status \
deployment/frontend \
-n product-catalog \
--timeout=180s



echo "================================="
echo "Validation"
echo "================================="


kubectl get pods -n product-catalog

kubectl get pods -n monitoring

kubectl get ingress -n product-catalog



echo "================================="
echo "Deployment Completed Successfully"
echo "================================="
