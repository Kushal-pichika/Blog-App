pipeline {
    agent any

    environment {
        DOCKERHUB = credentials('dockerhub-cred')
    }

    stages {
        stage('Checkout Code') {
            steps {
                // Explicitly clone the repo
                checkout([$class: 'GitSCM', branches: [[name: '*/main']],
                    userRemoteConfigs: [[url: 'https://github.com/Kushal-pichika/Blog-App.git']]
                ])
                sh 'ls -al'
            }
        }

        stage('Build Frontend Image') {
            steps {
                dir('Blog-frontend') {
                    sh 'docker build -t kushalpichika/blog-frontend:${BUILD_NUMBER} .'
                }
            }
        }

        stage('Build Backend Image') {
            steps {
                dir('Blog-api') {
                    sh 'docker build -t kushalpichika/blog-backend:${BUILD_NUMBER} .'
                }
            }
        }

        stage('Push Images') {
            steps {
                sh '''
                    echo $DOCKERHUB_PSW | docker login -u $DOCKERHUB_USR --password-stdin
                    docker push kushalpichika/blog-frontend:${BUILD_NUMBER}
                    docker push kushalpichika/blog-backend:${BUILD_NUMBER}
                '''
            }
        }
    }

    post {
        success {
            echo "✅ Build and push successful!"
        }
        failure {
            echo "❌ Build failed."
        }
    }
}
