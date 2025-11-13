// Declarative Pipeline
pipeline {
    // We will define the agent for each *stage*
    agent none 

    environment {
        DOCKER_REGISTRY_URL = "docker.io"
        DOCKER_USERNAME   = "your-docker-username" // Your Docker Hub username
        KUBE_CONFIG       = "your-kubeconfig-credentials-id" 
        DOCKER_CREDS      = "your-docker-credentials-id"     
        FRONTEND_APP_NAME = "blog-frontend"
        BACKEND_APP_NAME  = "blog-api" 
        K8S_NAMESPACE     = "default"
    }

    stages {
        stage('Checkout') {
            // 'agent any' is fine, this uses the default pod
            agent any
            steps {
                echo 'Checking out code from GitHub...'
                checkout scm
            }
        }

        // --- CI PHASE ---

        stage('Run Tests') {
            // This stage needs 'npm', so we create a pod with a 'node' container
            agent {
                kubernetes {
                    containerTemplate {
                        name 'node'
                        image 'node:18-alpine'
                        command 'sleep'
                        args '99d'
                        ttyEnabled true
                    }
                }
            }
            steps {
                // Run all steps inside the 'node' container
                container('node') {
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
        }

        stage('Build & Push Images') {
            // This stage needs 'docker' and access to the host's Docker socket
            agent {
                kubernetes {
                    // Define a pod with a 'docker' container
                    containerTemplate {
                        name 'docker'
                        image 'docker:latest'
                        command 'sleep'
                        args '99d'
                        ttyEnabled true
                        // Mount the Docker socket from the node (Docker-out-of-Docker)
                        volumeMounts {
                            mountPath '/var/run/docker.sock'
                            name 'docker-sock'
                        }
                    }
                    // Define the volume to be mounted
                    volumes {
                        hostPathVolume {
                            hostPath '/var/run/docker.sock'
                            name 'docker-sock'
                        }
                    }
                }
            }
            steps {
                // Run all steps inside the 'docker' container
                container('docker') {
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
        }

        // --- CD PHASE ---
        
        stage('Deploy to Kubernetes') {
            // This stage needs 'kubectl'
            agent {
                kubernetes {
                    containerTemplate {
                        name 'kubectl'
                        image 'bitnami/kubectl:latest'
                        command 'sleep'
                        args '99d'
                        ttyEnabled true
                    }
                }
            }
            steps {
                // Run all steps inside the 'kubectl' container
                container('kubectl') {
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
    }
    
    post {
        always {
            // This 'post' block also needs an agent to run 'docker logout'
            agent {
                kubernetes {
                    containerTemplate {
                        name 'docker'
                        image 'docker:latest'
                        command 'sleep'
                        args '9d'
                        ttyEnabled true
                        volumeMounts {
                            mountPath '/var/run/docker.sock'
                            name 'docker-sock'
                        }
                    }
                    volumes {
                        hostPathVolume {
                            hostPath '/var/run/docker.sock'
                            name 'docker-sock'
                        }
                    }
                }
            }
            steps {
                container('docker') {
                    echo 'Pipeline finished. Logging out.'
                    sh "docker logout ${env.DOCKER_REGISTRY_URL}"
                }
            }
        }
    }
}
