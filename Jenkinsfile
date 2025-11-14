pipeline {
    agent any

    environment {
        DOCKER_USERNAME = "kushalpichika"
        KUBE_CONFIG = credentials('kubecred')
        DOCKER_CREDS = credentials('dockercred')
    }

    stages {
        stage('Backend - Build Image') {
            steps {
                sh 'docker build -t $DOCKER_USERNAME/blog-backend:latest ./backend'
            }
        }

        stage('Backend - Push Image') {
            steps {
                sh 'echo $DOCKER_CREDS_PSW | docker login -u $DOCKER_CREDS_USR --password-stdin'
                sh 'docker push $DOCKER_USERNAME/blog-backend:latest'
            }
        }

        stage('Frontend - Build Image') {
            steps {
                sh 'docker build -t $DOCKER_USERNAME/blog-frontend:latest ./frontend'
            }
        }

        stage('Frontend - Push Image') {
            steps {
                sh 'echo $DOCKER_CREDS_PSW | docker login -u $DOCKER_CREDS_USR --password-stdin'
                sh 'docker push $DOCKER_USERNAME/blog-frontend:latest'
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                writeFile file: 'kubeconfig', text: "$KUBE_CONFIG"
                sh '''
                export KUBECONFIG=kubeconfig
                kubectl apply -f k8s/
                '''
            }
        }
    }
}
