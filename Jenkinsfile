// Corrected Declarative Pipeline (Kubernetes agents per-stage)
pipeline {
    agent none

    environment {
        DOCKER_REGISTRY_URL = "docker.io"
        DOCKER_USERNAME     = "kushalpichika"   // your Docker Hub username
        KUBE_CONFIG         = "kubecred"        // kubeconfig credential id
        DOCKER_CREDS        = "dockercred"      // Docker Hub creds id

        FRONTEND_APP_NAME   = "blog-frontend"
        BACKEND_APP_NAME    = "blog-api"
        K8S_NAMESPACE       = "default"
    }

    stages {
        stage('Checkout') {
            agent { label 'main' } // any controller/agent that can reach Git
            steps {
                echo 'Checking out code from GitHub...'
                checkout scm

                sh 'git rev-parse --short HEAD > git-tag.txt'
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
    image: node:18
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
                                // replace with real test command when ready:
                                sh 'npm test || true'
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
    image: node:18
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
                                // replace with real test command when ready:
                                sh 'npm test || true'
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
    image: docker:24-dind
    securityContext:
      privileged: true
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
                    unstash 'git-tag'

                    withCredentials([usernamePassword(credentialsId: env.DOCKER_CREDS,
                                                      usernameVariable: 'DOCKER_USER',
                                                      passwordVariable: 'DOCKER_PASS')]) {
                        // Use the credential variables provided by withCredentials
                        sh 'echo "$DOCKER_PASS" | docker login "$DOCKER_REGISTRY_URL" -u "$DOCKER_USER" --password-stdin'
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
    args: ["99d"]
    tty: true
'''
                }
            }
            steps {
                container('kubectl') {
                    unstash 'git-tag'

                    echo "Deploying new version to Kubernetes..."

                    // uses the Kubernetes Credentials Plugin's withKubeConfig
                    withKubeConfig([credentialsId: env.KUBE_CONFIG]) {
                        script {
                            def imageTag = readFile('git-tag.txt').trim()

                            def frontendImage = "${env.DOCKER_USERNAME}/${env.FRONTEND_APP_NAME}:${imageTag}"
                            def backendImage  = "${env.DOCKER_USERNAME}/${env.BACKEND_APP_NAME}:${imageTag}"

                            // Update deployments (assumes container names equal to app names)
                            sh """
                              kubectl -n ${env.K8S_NAMESPACE} set image deployment/${env.FRONTEND_APP_NAME} \
                                ${env.FRONTEND_APP_NAME}=${frontendImage} --record
                            """

                            sh """
                              kubectl -n ${env.K8S_NAMESPACE} set image deployment/${env.BACKEND_APP_NAME} \
                                ${env.BACKEND_APP_NAME}=${backendImage} --record
                            """

                            sh "kubectl -n ${env.K8S_NAMESPACE} rollout status deployment/${env.FRONTEND_APP_NAME}"
                            sh "kubectl -n ${env.K8S_NAMESPACE} rollout status deployment/${env.BACKEND_APP_NAME}"
                        }
                    }
                }
            }
        }
    } // stages

    post {
        always {
            echo 'Pipeline finished.'
        }
        failure {
            echo 'Build failed — collect logs and artifacts as needed.'
        }
    }
}
