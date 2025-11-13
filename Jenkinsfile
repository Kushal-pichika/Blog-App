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
            // This 'parallel' block is now the top-level element in this stage
            parallel {
                stage('Test Frontend') {
                    // Each parallel stage gets its own agent
                    agent {
                        kubernetes {
                            // Define the pod using raw YAML
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
                                sh 'npm test' 
                            }
                        }
                    }
                }
                stage('Test Backend') {
                    // Each parallel stage gets its own agent
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
                                sh 'npm test'
                            }
                        }
                    }
                }
            }
        }

        stage('Build & Push Images') {
            agent {
                kubernetes {
                    // This pod YAML defines a 'docker' container
                    // and correctly mounts the docker.sock volume
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
                        args: ["99d"]
                        tty: true
                    '''
                }
            }
            steps {
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
            // This 'post' block also needs a correct agent to run 'docker logout'
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
                        args: ["9d"]
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
                    echo 'Pipeline finished. Logging out.'
                    sh "docker logout ${env.DOCKER_REGISTRY_URL}"
                }
            }
        }
    }
}