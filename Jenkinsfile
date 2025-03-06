pipeline {
    agent any  // Runs on any available Jenkins agent

    environment {
        NODEJS_HOME = '/usr/local/bin' // Set Node.js path if needed
        PATH = "${NODEJS_HOME}:${PATH}"
    }

    options {
        timeout(time: 10, unit: 'MINUTES') // Fail the build if it runs too long
    }

    stages {
        stage('Checkout Code') {
            steps {
                script {
                    try {
                        git 'https://github.com/vurvn/Playwright-Automated-Tests.git'
                    } catch (Exception e) {
                        error "❌ Failed to clone repository: ${e.getMessage()}"
                    }
                }
            }
        }

        stage('Install Dependencies') {
            steps {
                script {
                    try {
                        sh 'npm install'
                    } catch (Exception e) {
                        error "❌ Failed to install dependencies: ${e.getMessage()}"
                    }
                }
            }
        }

        stage('Run Playwright Tests') {
            steps {
                script {
                    try {
                        sh 'npx playwright test'
                    } catch (Exception e) {
                        error "❌ Tests failed: ${e.getMessage()}"
                    }
                }
            }
        }

        stage('Generate Report') {
            steps {
                script {
                    try {
                        // Ensure the report is generated
                        sh 'npx playwright test --reporter=html'

                    } catch (Exception e) {
                        error "❌ Failed to generate Playwright report: ${e.getMessage()}"
                    }
                }
            }
        }

        // stage('Archive Playwright Report') {
        //     steps {
        //         script {
        //             try {
                        
        //                 // Archive the HTML report so you can view it in Jenkins
        //                 sh 'zip -r playwright-report.zip playwright-report' // Compress the report
        //                 archiveArtifacts artifacts: 'playwright-report.zip', fingerprint: true
        //             } catch (Exception e) {
        //                 error "❌ Failed to save Playwright report: ${e.getMessage()}"
        //             }
        //         }
        //     }
        // }
    }

    post {
        always {
            script {
                echo "📜 Archive Playwright Report..."
                sh 'zip -r playwright-report.zip playwright-report || true' // Avoid failure if folder doesn't exist
                archiveArtifacts artifacts: 'playwright-report.zip', fingerprint: true
            }
        }
        success {
            echo "✅ Build completed successfully!"
        }
        failure {
            echo "❌ Build failed! Check the logs for details."
        }
        always {
            echo "📜 Playwright Test Execution Completed."
        }
    }
}
