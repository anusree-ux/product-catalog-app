pipeline {
    agent {
        kubernetes {
            yaml '''
apiVersion: v1
kind: Pod
spec:
  containers:
    - name: dind
      image: docker:24-dind
      securityContext:
        privileged: true
      env:
        - name: DOCKER_TLS_CERTDIR
          value: ""
      volumeMounts:
        - name: docker-storage
          mountPath: /var/lib/docker
    - name: docker
      image: docker:24-cli
      command: ['cat']
      tty: true
      env:
        - name: DOCKER_HOST
          value: tcp://localhost:2375
    - name: kubectl
      image: alpine/k8s:1.30.2
      command: ['cat']
      tty: true
  volumes:
    - name: docker-storage
      emptyDir: {}
'''
        }
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
         stage('Wait for Docker Daemon') {
            steps {
                container('docker') {
                    sh '''
                        for i in $(seq 1 30); do
                          if docker info > /dev/null 2>&1; then
                            echo "Docker daemon is ready."
                            exit 0
                          fi
                          echo "Waiting for Docker daemon... ($i/30)"
                          sleep 2
                        done
                        echo "Docker daemon did not become ready in time."
                        exit 1
                    '''
                }
            }
        }


        stage('Build Backend Image') {
            steps {
                container('docker') {
                    sh '''
                        docker build \
                          -t anusree15/product-backend:${BUILD_NUMBER} \
                          -t anusree15/product-backend:latest \
                          ./backend
                    '''
                    
                }
            }
        }

        stage('Build Frontend Image') {
            steps {
                container('docker') {
                    sh '''
                        docker build \
                          -t anusree15/product-frontend:${BUILD_NUMBER} \
                          -t anusree15/product-frontend:latest \
                          ./frontend
                    '''
                }
            }
        }
        
        stage('Push Images') {
            steps {
                container('docker') {
                    withCredentials([usernamePassword(
                        credentialsId: 'dockerhub-creds',
                        usernameVariable: 'DOCKERHUB_USER',
                        passwordVariable: 'DOCKERHUB_TOKEN'
                    )]) {
                        sh '''
                            echo "$DOCKERHUB_TOKEN" | docker login -u "$DOCKERHUB_USER" --password-stdin
                            docker push anusree15/product-backend:${BUILD_NUMBER}
                            docker push anusree15/product-backend:latest
                            docker push anusree15/product-frontend:${BUILD_NUMBER}
                            docker push anusree15/product-frontend:latest
                        '''
                    }
                }
            }
        }

        stage('Validate K8s Manifests') {
            steps {
                container('kubectl') {
                    sh 'kubectl apply --dry-run=client -k k8s/base'
                }
            }
        }
    }

    post {
        success {
            echo "Build ${BUILD_NUMBER} completed successfully. Images tagged product-backend:${BUILD_NUMBER} and product-frontend:${BUILD_NUMBER} (not pushed)."
        }
        failure {
            echo "Build ${BUILD_NUMBER} failed — check stage logs above."
        }
    }
}
