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
      image: bitnami/kubectl:latest
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
                    sh 'docker build -t product-backend:${BUILD_NUMBER} ./backend'
                }
            }
        }

        stage('Build Frontend Image') {
            steps {
                container('docker') {
                    sh 'docker build -t product-frontend:${BUILD_NUMBER} ./frontend'
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
