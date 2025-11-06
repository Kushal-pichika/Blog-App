pipeline {
  agent any

  environment {
    DOCKERHUB_USER = credentials('dockerhub-cred')
    FRONTEND_DIR = 'Blog-frontend'
    BACKEND_DIR  = 'Blog-api'
    FRONTEND_IMAGE = 'kushalpichika/blog-frontend'
    BACKEND_IMAGE  = 'kushalpichika/blog-backend'
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Build Frontend Image') {
      steps {
        dir("${FRONTEND_DIR}") {
          script {
            docker.build("${FRONTEND_IMAGE}:${BUILD_NUMBER}")
          }
        }
      }
    }

    stage('Build Backend Image') {
      steps {
        dir("${BACKEND_DIR}") {
          script {
            docker.build("${BACKEND_IMAGE}:${BUILD_NUMBER}")
          }
        }
      }
    }

    stage('Push Images') {
      steps {
        script {
          docker.withRegistry('', 'dockerhub-cred') {
            docker.image("${FRONTEND_IMAGE}:${BUILD_NUMBER}").push()
            docker.image("${BACKEND_IMAGE}:${BUILD_NUMBER}").push()
          }
        }
      }
    }
  }

  post {
    success {
      echo "✅ Images pushed to Docker Hub successfully!"
    }
    failure {
      echo "❌ Build failed."
    }
  }
}
