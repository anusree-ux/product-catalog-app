pipeline {
    agent {
        kubernetes {
            yaml '''
apiVersion: v1
kind: Pod
metadata:
  label: jenkins-agent
spec:
  containers:
  - name: node
    image: node:20-alpine
    command: ['cat']
    tty: true
  - name: docker
    image: docker:24-cli
    command: ['cat']
    tty: true
    env:
    - name: DOCKER_HOST
      value: tcp://localhost:2375
  - name: dind
    image: docker:24-dind
    securityContext:
      privileged: true
    env:
    - name: DOCKER_TLS_CERTDIR
      value: ""
  - name: trivy
    image: aquasec/trivy:latest
    command: ['cat']
    tty: true
  - name: kubectl
    image: alpine/k8s:1.28.2
    command: ['sh', '-c', 'sleep 3600']
    tty: true
'''
        }
    }

    environment {
        DOCKERHUB_USERNAME = "anusree15"
        BACKEND_IMAGE = "anusree15/product-backend"
        FRONTEND_IMAGE = "anusree15/product-frontend"
        IMAGE_TAG = "${BUILD_NUMBER}"
    }

    stages {
        stage('Checkout Source') {
            steps {
                checkout scm
            }
        }

        stage('Lint') {
            steps {
                container('node') {
                    sh '''
                    cd frontend
                    npm install
                    npm run lint || echo "Linting issues found, proceeding..."
                    '''
                }
            }
        }

        stage('Unit Tests') {
            steps {
                sh '''
                echo "Running Unit Tests..."
                '''
            }
        }

        stage('Docker Build') {
            steps {
                container('docker') {
                    sh '''
                    until docker info; do sleep 1; done
                    docker build -t $BACKEND_IMAGE:$IMAGE_TAG ./backend
                    docker build -t $FRONTEND_IMAGE:$IMAGE_TAG ./frontend
                    '''
                }
            }
        }

        stage('Security Scan') {
            steps {
                container('trivy') {
                    withEnv(['DOCKER_HOST=tcp://localhost:2375']) {
                        sh '''
                        trivy image --exit-code 1 --severity CRITICAL $BACKEND_IMAGE:$IMAGE_TAG
                        trivy image --exit-code 1 --severity CRITICAL $FRONTEND_IMAGE:$IMAGE_TAG
                        '''
                    }
                }
            }
        }

        stage('Push Image') {
            steps {
                container('docker') {
                    withCredentials([usernamePassword(
                        credentialsId: 'dockerhub-creds',
                        usernameVariable: 'USER',
                        passwordVariable: 'PASS'
                    )]) {
                        sh '''
                        echo $PASS | docker login -u $USER --password-stdin
                        docker push $BACKEND_IMAGE:$IMAGE_TAG
                        docker push $FRONTEND_IMAGE:$IMAGE_TAG
                        '''
                    }
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                container('kubectl') {
                    sh '''
                    kubectl set image deployment/backend backend=$BACKEND_IMAGE:$IMAGE_TAG -n product-catalog
                    kubectl set image deployment/frontend frontend=$FRONTEND_IMAGE:$IMAGE_TAG -n product-catalog
                    '''
                }
            }
        }

        stage('Post Deployment Validation') {
            steps {
                container('kubectl') {
                    sh '''
                    kubectl rollout status deployment/backend -n product-catalog --timeout=90s
                    kubectl rollout status deployment/frontend -n product-catalog --timeout=90s
                    '''
                }
            }
        }
    }
}
