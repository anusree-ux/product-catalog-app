pipeline {

    agent any

    environment {
        BACKEND_IMAGE = "product-backend:1.0"
        FRONTEND_IMAGE = "product-frontend:1.0"
        NAMESPACE = "product-catalog"
        KIND_CLUSTER = "product-catalog"
    }

    stages {

        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        stage('Build Docker Images') {
            steps {
                sh '''
                echo "Building backend image..."
                docker build -t $BACKEND_IMAGE ./backend

                echo "Building frontend image..."
                docker build -t $FRONTEND_IMAGE ./frontend
                '''
            }
        }

        stage('Security Scan') {
            steps {
                sh '''
                echo "Scanning backend image..."
                trivy image --severity HIGH,CRITICAL $BACKEND_IMAGE

                echo "Scanning frontend image..."
                trivy image --severity HIGH,CRITICAL $FRONTEND_IMAGE
                '''
            }
        }

        stage('Load Images into Kind') {
            steps {
                sh '''
                echo "Loading images into Kind cluster..."

                kind load docker-image $BACKEND_IMAGE --name $KIND_CLUSTER
                kind load docker-image $FRONTEND_IMAGE --name $KIND_CLUSTER
                '''
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                sh '''
                echo "Deploying application..."

                kubectl apply -k k8s/base
                '''
            }
        }

        stage('Wait for Deployment') {
            steps {
                sh '''
                echo "Checking backend rollout..."
                kubectl rollout status deployment/backend \
                -n $NAMESPACE \
                --timeout=120s

                echo "Checking frontend rollout..."
                kubectl rollout status deployment/frontend \
                -n $NAMESPACE \
                --timeout=120s
                '''
            }
        }

        stage('Verify Application') {
            steps {
                sh '''
                echo "Checking pods..."
                kubectl get pods -n $NAMESPACE

                echo "Checking services..."
                kubectl get svc -n $NAMESPACE
                '''
            }
        }
    }

    post {
        success {
            echo "Deployment completed successfully!"
        }

        failure {
            echo "Deployment failed. Check logs."
        }
    }
}
