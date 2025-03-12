pipeline {
    agent any

    environment {
        NODEJS_HOME = '/usr/local/bin'
        PATH = "${NODEJS_HOME}:${PATH}"
        PLAYWRIGHT_BROWSERS_PATH = '0' // Cache browsers in agent to avoid re-downloading
    }

    parameters {
        choice(name: 'BRANCH_NAME', 
            choices: ['main', 'dev', 'master', 'feature-branch'], 
            description: 'Select the Git branch to build')
        booleanParam(name: 'RUN_ALL_BROWSERS', 
            defaultValue: false, 
            description: 'Run tests in all browsers (Chrome, Firefox, WebKit) instead of just Chromium')
    }

    options {
        timeout(time: 15, unit: 'MINUTES')
        disableConcurrentBuilds() // Prevent concurrent builds of the same branch
    }

    stages {
        stage('Cleanup') {
            steps {
                script {
                    echo "🧹 Cleaning up old reports and artifacts..."
                    sh '''
                    rm -rf playwright-report/ || true
                    rm -rf test-results/ || true
                    rm -rf artifacts/ || true
                    rm -f *.zip || true
                    '''
                }
            }
        }
        
        stage('Checkout Code') {
            steps {
                checkout([
                    $class: 'GitSCM',
                    branches: [[name: "${params.BRANCH_NAME}"]],
                    userRemoteConfigs: [[url: 'https://github.com/vurvn/Playwright-Automated-Tests.git']],
                    extensions: [[$class: 'CleanBeforeCheckout']] // Clean workspace before checkout
                ])
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm ci' // Uses package-lock.json for deterministic builds
            }
        }

        stage('Install Playwright Browsers') {
            steps {
                script {
                    if (params.RUN_ALL_BROWSERS) {
                        sh 'npx playwright install'
                    } else {
                        sh 'npx playwright install chromium'
                    }
                }
            }
        }

        stage('Run Playwright Tests') {
            steps {
                script {
                    try {
                        def browserProjects = params.RUN_ALL_BROWSERS ? '' : '--project=chromium'
                        sh "npx playwright test ${browserProjects} --reporter=html,junit"
                    } catch (Exception e) {
                        // We'll capture test failures but continue the pipeline
                        echo "Tests failed but continuing to generate reports: ${e.getMessage()}"
                        currentBuild.result = 'UNSTABLE'
                    } finally {
                        // Force report generation if tests crashed badly
                        echo "Ensuring report is generated even if tests crashed..."
                        sh "npx playwright show-report || true"
                    }
                }
            }
        }
    }

    post {
        always {
            script {
                // Extra defense: Generate report if it doesn't exist
                sh '''
                if [ ! -d "playwright-report" ] || [ ! -f "playwright-report/index.html" ]; then
                    echo "Report directory missing or empty, forcing report generation..."
                    mkdir -p playwright-report
                    npx playwright show-report || true
                fi
                '''
                
                // Archive JUnit reports for Jenkins test trend
                junit(testResults: 'playwright-report/junit*.xml', allowEmptyResults: true)
                
                // Create a zip of the report but don't display it in UI
                sh '''
                mkdir -p artifacts
                zip -r artifacts/playwright-report.zip playwright-report || true
                '''
                
                // Archive only the ZIP file
                archiveArtifacts(
                    artifacts: 'artifacts/playwright-report.zip', 
                    fingerprint: true, 
                    allowEmptyArchive: false, // Fail if archive is empty
                    onlyIfSuccessful: false   // Save even on failure
                )
                
                // Clean up to save disk space
                sh 'rm -rf node_modules || true'
                sh 'rm -rf playwright-report || true'  // Remove the raw report directory after zipping
            }
        }
        success {
            echo "✅ Build completed successfully!"
        }
        unstable {
            echo "⚠️ Tests failed but reports were generated!"
        }
        failure {
            echo "❌ Build failed! Check the logs for details."
        }
    }
}