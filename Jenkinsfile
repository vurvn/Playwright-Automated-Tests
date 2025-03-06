pipeline {
    agent any  // Run on any available agent

    stages {
        stage('Checkout Code') {
            steps {
                git 'https://github.com/vurvn/Playwright-Automated-Tests'  // Replace with your GitHub repo
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'  // Install Playwright dependencies
            }
        }

        stage('Run Playwright API Tests') {
            steps {
                sh 'npx playwright test'  // Run API tests
            }
        }

        stage('Generate Report') {
            steps {
                sh 'npx playwright show-report'  // Generate test report
            }
        }
    }
}
