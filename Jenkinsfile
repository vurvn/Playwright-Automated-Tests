pipeline {
    agent any  // Run on any available agent

    stages {
        stage('Check Shell') {
            steps {
                sh 'echo $SHELL'
            }
        }

        stage('Checkout Code') {
            steps {
                git 'https://github.com/vurvn/Playwright-Automated-Tests'  // Replace with your GitHub repo
            }
        }

        stage('Debug Environment') {
            steps {
                sh 'set -x' // Enable debug mode
                sh 'echo "Checking environment variables..."'
                sh 'env'
            }
        }

        stage('Run Playwright API Tests') {
            steps {
                sh 'set -x && npx playwright test'
            }
        }

        stage('Generate Report') {
            steps {
                sh 'set -x && npx playwright show-report'
            }
        }
        
    }
}
