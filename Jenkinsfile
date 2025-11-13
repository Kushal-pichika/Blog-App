// Declarative Pipeline
pipeline {
    agent any

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
                
                // Get the git hash and save it to a file
                sh 'git rev-parse --short HEAD > git-tag.txt'
                
                // --- NEW: Stash the file to save it for other stages ---
                stash name: 'git-tag', includes: 'git-tag.txt'
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
                    // --- NEW: Unstash the file so we can read it ---
                    unstash 'git-tag'
                
                    withCredentials([usernamePassword(credentialsId: env.DOCKER_CREDS, usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                        sh 'echo "$DOCKER_PASS" | docker login "$DOCKER_REGISTRY_URL" -u "$DOCKER_USERNAME" --password-stdin'
                    }

                    script {
                        def imageTag = readFile('git-tag.txt').trim()
                        
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
                        args: ["9d"]
                        tty: true
                    '''
                }
            }
            steps {
                container('kubectl') {
                    // --- NEW: Unstash the file here too ---
                    unstash 'git-tag'
                
                    echo "Deploying new version to Kubernetes..."
                    withKubeconfig([credentialsId: env.KUBE_CONFIG]) {
                        
                        script {
                            def imageTag = readFile('git-tag.txt').trim()
                            
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
    }
    
    post {
        always {
            echo 'Pipeline finished.'
        }
    }
}