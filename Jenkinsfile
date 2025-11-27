pipeline {
    agent any

    tools {
        nodejs "node"
    }

    stages {

        stage('Pull Code from GitHub') {
            steps {
                git branch: 'main',
                url: 'https://github.com/Kushal12082004/Blog-App'
            }
        }

        stage('Check Node Version') {
            steps {
                dir('Blog-frontend') {
                    sh 'node -v'
                    sh 'npm -v'
                }
            }
        }

        stage('Install Dependencies') {
            steps {
                dir('Blog-frontend') {
                    sh 'npm install'
                }
            }
        }

        stage('Build Project') {
            steps {
                dir('Blog-frontend') {
                    sh 'npm run build'
                }
            }
        }

        stage('Run Automated Tests') {
            steps {
                dir('Blog-frontend') {
                    sh 'echo "✅ No test script configured. Skipping tests safely."'
                }
            }
        }
    }

    post {
        success {
            echo "✅ Build Completed Successfully!"
        }
        failure {
            echo "❌ Build Failed!"
        }
        always {
            echo "📊 Pipeline Execution Completed"
        }
    }
}
