// Declarative Pipeline
pipeline {
    agent any // Use any available Jenkins agent

    environment {
        // --- IMPORTANT: CHANGE THESE! ---
        DOCKER_REGISTRY_URL = "docker.io"
        DOCKER_USERNAME   = "kushalpichika" // Your Docker Hub username
        KUBE_CONFIG       = "kube-cred" // The ID from Jenkins credentials
        DOCKER_CREDS      = "dockerhub-cred"     // The ID from Jenkins credentials

        // App-specific names
        FRONTEND_APP_NAME = "blog-frontend"
        BACKEND_APP_NAME  = "blog-api" // Changed to match your repo
        K8S_NAMESPACE     = "default" // Using 'default' is safer for now
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out code from GitHub...'
                checkout scm
            }
        }

        // --- CI PHASE ---

        stage('Run Tests') {
            parallel {
                stage('Test Frontend') {
                    steps {
                        echo "Running frontend tests..."
                        // --- CORRECTED PATH ---
                        dir('Blog-frontend') {
                            sh 'npm install'
                            sh 'npm test' 
                        }
                    }
                }
                stage('Test Backend') {
                    steps {
                        echo "Running backend tests..."
                        // --- CORRECTED PATH ---
                        dir('Blog-api') {
                            sh 'npm install'
                            sh 'npm test'
                        }
                    }
                }
            }
        }

        stage('Build & Push Images') {
            steps {
                withCredentials([usernamePassword(credentialsId: env.DOCKER_CREDS, usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh "echo $DOCKER_PASS | docker login ${env.DOCKER_REGISTRY_URL} -u $DOCKER_USER --password-stdin"
                }

                script {
                    def imageTag = sh(returnStdout: true, script: 'git rev-parse --short HEAD').trim()
                    
                    // Build and Push Frontend
                    def frontendImage = "${env.DOCKER_USERNAME}/${env.FRONTEND_APP_NAME}:${imageTag}"
                    // --- CORRECTED PATHS ---
                    sh "docker build -f Blog-frontend/Dockerfile -t ${frontendImage} ./Blog-frontend"
                    sh "docker push ${frontendImage}"

                    // Build and Push Backend
                    def backendImage = "${env.DOCKER_USERNAME}/${env.BACKEND_APP_NAME}:${imageTag}"
                    // --- CORRECTED PATHS ---
                    sh "docker build -f Blog-api/Dockerfile -t ${backendImage} ./Blog-api"
                    sh "docker push ${backendImage}"
                }
            }
        }

        // --- CD PHASE ---
        
        stage('Deploy to Kubernetes') {
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
            sh 'docker logout ${env.DOCKER_REGISTRY_URL}'
        }
    }
}