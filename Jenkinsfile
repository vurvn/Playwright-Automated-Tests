pipeline {
    agent any  // Runs on any available Jenkins agent

    environment {
        NODEJS_HOME = '/usr/local/bin' // Set Node.js path if needed
        PATH = "${NODEJS_HOME}:${PATH}"
    }

    parameters {
        choice(name: 'BRANCH_NAME', 
            choices: ['main', 'master', 'dev', 'feature-branch'], 
            description: 'Select the Git branch to build')
    }

    options {
        skipDefaultCheckout(true)  // This prevents automatic SCM checkout
        timeout(time: 10, unit: 'MINUTES') // Fail the build if it runs too long
    }

    stages {
        stage('Checkout Code') {
            steps {
                //  echo "Skipping manual checkout, using Jenkins default checkout."
                git branch: "${BRANCH_NAME}", url: 'https://github.com/vurvn/Playwright-Automated-Tests.git'
                
                // script {
                //     try {
                //         checkout([
                //             $class: 'GitSCM',
                //             branches: [[name: "${BRANCH_NAME}"]],
                //             userRemoteConfigs: [[url: 'https://github.com/vurvn/Playwright-Automated-Tests.git']]
                // ])
                //     } catch (Exception e) {
                //         error "❌ Failed to clone repository from branch '${BRANCH_NAME}': ${e.getMessage()}"
                //     }
                // }
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

        stage('Run & Generate Report Playwright Tests') {
            steps {
                script {
                    try {
                        //Runs tests only in Chromium 
                        sh 'npx playwright test --project=chromium --reporter=html'  
                    } catch (Exception e) {
                        error "❌ Run & Generate Report failed: ${e.getMessage()}"
                    }
                }
            }
        }
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
        
    }
}
