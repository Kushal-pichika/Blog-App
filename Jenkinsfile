pipeline {
    agent any

    environment {
        DOCKER_USER = "kushalpichika"
        DOCKER_CREDS = "dockerhub-cred"
        KUBECONFIG_CRED = credentials('kube-config')
    }

    stages {
        stage('Checkout') {
            steps {
                git 'https://github.com/Kushal-pichika/Blog-App.git'
            }
        }

        stage('Build Backend') {
            steps {
                sh 'docker build -t $DOCKER_USER/blog-backend:latest ./Blog-api'
            }
        }

        stage('Build Frontend') {
            steps {
                sh 'docker build -t $DOCKER_USER/blog-frontend:latest ./Blog-frontend'
            }
        }

        stage('Push Images') {
            steps {
                script {
                    docker.withRegistry('https://index.docker.io/v1/', DOCKER_CREDS) {
                        sh 'docker push $DOCKER_USER/blog-backend:latest'
                        sh 'docker push $DOCKER_USER/blog-frontend:latest'
                    }
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                writeFile file: 'kubeconfig', text: KUBECONFIG_CRED
                sh '''
                  export KUBECONFIG=kubeconfig
                  kubectl apply -f k8s/
                '''
            }
        }
    }
}
