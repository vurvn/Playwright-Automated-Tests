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
                // FOR SKIP MANUAL CHECKOUT
                // echo "Skipping manual checkout, using Jenkins default checkout."

                //git branch: "${BRANCH_NAME}", url: 'https://github.com/vurvn/Playwright-Automated-Tests.git'
                
                
                //If BRANCH_NAME doesn't exist, Jenkins may fail.
                //Alternative: Use checkout scm for better handling:
                script {
                    try {
                        checkout([
                            $class: 'GitSCM',
                            branches: [[name: "${BRANCH_NAME}"]],
                            userRemoteConfigs: [[url: 'https://github.com/vurvn/Playwright-Automated-Tests.git']]
                ])
                    } catch (Exception e) {
                        error "❌ Failed to clone repository from branch '${BRANCH_NAME}': ${e.getMessage()}"
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

        stage('Cleanup Old Reports') {
            steps {
                script {
                    sh 'rm -f playwright-report.zip' // Remove any previous zip file
                    if (fileExists('playwright-report/index.html')) {
                        sh 'zip -r playwright-report.zip playwright-report/' // Create a new zip file
                    } else {
                        error "❌ No Playwright report found!"
                    }
                    sh 'ls -lh playwright-report.zip' // List file to confirm it exists
                }
            }
        }
    }
    

    post {
        always {
            script {
                echo "📜 Archive Playwright Report..."
                archiveArtifacts artifacts: '**/playwright-report.zip', fingerprint: true, onlyIfSuccessful: true
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
