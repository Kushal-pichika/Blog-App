// Declarative Pipeline
pipeline {
    // We will define the agent for each *stage*, so we set 'none' here
    agent none 

    environment {
        // --- IMPORTANT: CHANGE THESE! ---
        DOCKER_REGISTRY_URL = "docker.io"
        DOCKER_USERNAME   = "kushalpichika" // Your Docker Hub username
        KUBE_CONFIG       = "kube-cred" // The ID from Jenkins credentials
        DOCKER_CREDS      = "dockerhub-cred"     // The ID from Jenkins credentials

        // App-specific names
        FRONTEND_APP_NAME = "blog-frontend"
        BACKEND_APP_NAME  = "blog-api" 
        K8S_NAMESPACE     = "default"
    }

    stages {
        stage('Checkout') {
            // 'agent any' is fine here, as checkout just needs Git
            agent any
            steps {
                echo 'Checking out code from GitHub...'
                checkout scm
            }
        }

        // --- CI PHASE ---

        stage('Run Tests') {
            // This stage needs 'npm', so we use a 'node' container
            agent { 
                docker { image 'node:18-alpine' } 
            }
            steps {
                parallel {
                    stage('Test Frontend') {
                        steps {
                            echo "Running frontend tests..."
                            dir('Blog-frontend') {
                                sh 'npm install'
                                sh 'npm test' 
                            }
                        }
                    }
                    stage('Test Backend') {
                        steps {
                            echo "Running backend tests..."
                            dir('Blog-api') {
                                sh 'npm install'
                                sh 'npm test'
                            }
                        }
                    }
                }
            }
        }

        stage('Build & Push Images') {
            // This stage needs 'docker'
            agent {
                docker {
                    image 'docker:latest'
                    // This mounts your local Docker socket (from Minikube)
                    // so the container can run docker commands
                    args '-v /var/run/docker.sock:/var/run/docker.sock'
                }
            }
            steps {
                withCredentials([usernamePassword(credentialsId: env.DOCKER_CREDS, usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh "echo $DOCKER_PASS | docker login ${env.DOCKER_REGISTRY_URL} -u $DOCKER_USER --password-stdin"
                }

                script {
                    def imageTag = sh(returnStdout: true, script: 'git rev-parse --short HEAD').trim()
                    
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
            // This stage needs 'kubectl'
            agent {
                docker { image 'bitnami/kubectl:latest' }
            }
            steps {
                echo "Deploying new version to Kubernetes..."
                withKubeconfig([credentialsId: env.KUBE_CONFIG]) {
                    script {
                        def imageTag = sh(returnStdout: true, script: 'git rev-parse --short HEAD').trim()
                        def frontendImage = "${env.DOCKER_USERNAME}/${env.FRONTEND_APP_NAME}:${imageTag}"
                        def backendImage = "${env.DOCKER_USERNAME}/${env.BACKEND_APP_NAME}:${imageTag}"

                        sh """
                        kubectl set image deployment/${env.FRONTEND_APP_NAME} \
                          ${env.FRONTEND_APP_NAME}=${frontendImage} \
                          -n ${env.K8S_NAMESPACE} \
                          --record
                        """
                        
                        sh """
                        kubectl set image deployment/${env.BACKEND_APP_NAME} \
                          ${env.BACKEND_APP_NAME}=${backendImage} \
                          -n ${env.K8S_NAMESPACE} \
                          --record
                        """
                        
                        sh "kubectl rollout status deployment/${env.FRONTEND_APP_NAME} -n ${env.K8S_NAMESPACE}"
                        sh "kubectl rollout status deployment/${env.BACKEND_APP_NAME} -n ${env.K8S_NAMESPACE}"
                    }
                }
            }
        }
    }
    
    post {
        always {
            echo 'Pipeline finished.'
            // This 'agent' block is needed so the 'post'
            // action has the 'docker' command available.
            agent {
                docker {
                    image 'docker:latest'
                    args '-v /var/run/docker.sock:/var/run/docker.sock'
                }
            }
            steps {
                // FIXED: 'sh' needs double quotes here to read the variable
                sh "docker logout ${env.DOCKER_REGISTRY_URL}"
            }
        }
    }
}
