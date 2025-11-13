// Declarative Pipeline
pipeline {
    agent any

    // --- CHANGE 1: Define imageTag here ---
    def imageTag 

    environment {
        DOCKER_REGISTRY_URL = "docker.io"
        DOCKER_USERNAME   = "kushalpichika" // Your Docker Hub username
        KUBE_CONFIG       = "kube-cred" 
        DOCKER_CREDS      = "dockerhub-cred"     
        FRONTEND_APP_NAME = "blog-frontend"
        BACKEND_APP_NAME  = "blog-api" 
        K8S_NAMESPACE     = "default"
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out code from GitHub...'
                checkout scm
                
                // --- CHANGE 2: Get the git hash here ---
                script {
                    imageTag = sh(returnStdout: true, script: 'git rev-parse --short HEAD').trim()
                    echo "Image tag set to: ${imageTag}"
                }
            }
        }

        // --- CI PHASE ---

        stage('Run Tests') {
            parallel {
                stage('Test Frontend') {
                    agent {
                        kubernetes {
                            yaml '''
                            apiVersion: v1
                            kind: Pod
                            spec:
                              containers:
                              - name: node
                                image: node:18-alpine
                                command: ["sleep"]
                                args: ["99d"]
                                tty: true
                            '''
                        }
                    }
                    steps {
                        container('node') {
                            echo "Running frontend tests..."
                            dir('Blog-frontend') {
                                sh 'npm install'
                                echo "Skipping frontend tests."
                            }
                        }
                    }
                }
                stage('Test Backend') {
                    agent {
                        kubernetes {
                            yaml '''
                            apiVersion: v1
                            kind: Pod
                            spec:
                              containers:
                              - name: node
                                image: node:18-alpine
                                command: ["sleep"]
                                args: ["99d"]
                                tty: true
                            '''
                        }
                    }
                    steps {
                        container('node') {
                            echo "Running backend tests..."
                            dir('Blog-api') {
                                sh 'npm install'
                                echo "Skipping backend tests."
                            }
                        }
                    }
                }
            }
        }

        stage('Build & Push Images') {
            agent {
                kubernetes {
                    yaml '''
                    apiVersion: v1
                    kind: Pod
                    spec:
                      containers:
                      - name: docker
                        image: docker:latest
                        command: ["sleep"]
                        args: ["99d"]
                        tty: true
                        volumeMounts:
                        - name: docker-sock
                          mountPath: /var/run/docker.sock
                      volumes:
                      - name: docker-sock
                        hostPath:
                          path: /var/run/docker.sock
                    '''
                }
            }
            steps {
                container('docker') {
                    withCredentials([usernamePassword(credentialsId: env.DOCKER_CREDS, usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                        sh 'echo "$DOCKER_PASS" | docker login "$DOCKER_REGISTRY_URL" -u "$DOCKER_USERNAME" --password-stdin'
                    }

                    // --- CHANGE 3: No 'script' block needed ---
                    // We just use the 'imageTag' variable
                    def frontendImage = "${env.DOCKER_USERNAME}/${env.FRONTEND_APP_NAME}:${imageTag}"
                    sh "docker build -f Blog-frontend/Dockerfile -t ${frontendImage} ./Blog-frontend"
                    sh "docker push ${frontendImage}"

                    def backendImage = "${env.DOCKER_USERNAME}/${env.BACKEND_APP_NAME}:${imageTag}"
                    sh "docker build -f Blog-api/Dockerfile -t ${backendImage} ./Blog-api"
                    sh "docker push ${backendImage}"
                }
            }
        }

        // --- CD PHASE ---
        
        stage('Deploy to Kubernetes') {
            agent {
                kubernetes {
                    yaml '''
                    apiVersion: v1
                    kind: Pod
                    spec:
                      containers:
                      - name: kubectl
                        image: bitnami/kubectl:latest
                        command: ["sleep"]
                        args: ["9d"]
                        tty: true
                    '''
                }
            }
            steps {
                container('kubectl') {
                    echo "Deploying new version to Kubernetes..."
                    withKubeconfig([credentialsId: env.KUBE_CONFIG]) {
                        
                        // --- CHANGE 3 (cont.): Also use the variable here ---
                        def frontendImage = "${env.DOCKER_USERNAME}/${env.FRONTEND_APP_NAME}:${imageTag}"
                        def backendImage = "${env.DOCKER_USERNAME}/${env.BACKEND_APP_NAME}:${imageTag}"

                        sh """
                        kubectl set image deployment/${env.FRONTEND_APP_NAME} \
                          ${env.FRONTEND_APP_NAME}=${frontendImage} \
                          -n ${env.K_NAMESPACE} \
                          --record
                        """
                        
                        sh """
                        kubectl set image deployment/${env.BACKEND_APP_NAME} \
                          ${env.BACKEND_APP_NAME}=${backendImage} \
                          -n ${env.K_NAMESPACE} \
                          --record
                        """
                        
                        sh "kubectl rollout status deployment/${env.FRONTEND_APP_NAME} -n ${env.K_NAMESPACE}"
                        sh "kubectl rollout status deployment/${env.BACKEND_APP_NAME} -n ${env.K_NAMESPACE}"
                    }
                }
            }
        }
    }
    
    post {
        always {
            echo 'Pipeline finished.'
        }
    }
}