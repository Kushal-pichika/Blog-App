pipeline {
    agent any

    tools {
        nodejs "NodeJS"
    }

    stages {

        stage('Pull Code from GitHub') {
            steps {
                git branch: 'main', url: 'https://github.com/Kushal12082004/Blog-App'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Build Project') {
            steps {
                sh 'npm run build'
            }
        }

        stage('Run Automated Tests') {
            steps {
                sh 'npm test'
            }
        }
    }

    post {
        success {
            echo "✅ Build & Tests Successful!"
        }

        failure {
            echo "❌ Build or Tests Failed!"
        }

        always {
            echo "📊 Pipeline Execution Completed"
        }
    }
}
