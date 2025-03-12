pipeline {
    agent any

    environment {
        NODEJS_HOME = '/usr/local/bin'
        PATH = "${NODEJS_HOME}:${PATH}"
        // Set a fixed location for browser binaries, shared between builds
        PLAYWRIGHT_BROWSERS_PATH = '/var/jenkins_home/playwright-browsers'
        // Skip browser download if already installed
        PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD = '1'
    }

    parameters {
        choice(name: 'BRANCH_NAME', 
            choices: ['main', 'dev', 'master', 'feature-branch'], 
            description: 'Select the Git branch to build')
        booleanParam(name: 'RUN_ALL_BROWSERS', 
            defaultValue: false, 
            description: 'Run tests in all browsers (Chrome, Firefox, WebKit) instead of just Chromium')
        booleanParam(name: 'FORCE_BROWSER_DOWNLOAD', 
            defaultValue: false, 
            description: 'Force browsers to be downloaded even if already installed')
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
                    // Create browsers directory if it doesn't exist
                    sh "mkdir -p ${env.PLAYWRIGHT_BROWSERS_PATH}"
                    
                    // Check if browser is already installed
                    def chromiumExists = sh(script: "test -d ${env.PLAYWRIGHT_BROWSERS_PATH}/chromium-* && echo 'true' || echo 'false'", returnStdout: true).trim()
                    def firefoxExists = sh(script: "test -d ${env.PLAYWRIGHT_BROWSERS_PATH}/firefox-* && echo 'true' || echo 'false'", returnStdout: true).trim()
                    def webkitExists = sh(script: "test -d ${env.PLAYWRIGHT_BROWSERS_PATH}/webkit-* && echo 'true' || echo 'false'", returnStdout: true).trim()
                    
                    if (params.FORCE_BROWSER_DOWNLOAD || chromiumExists == 'false') {
                        echo "Installing Chromium browser..."
                        sh "PLAYWRIGHT_BROWSERS_PATH=${env.PLAYWRIGHT_BROWSERS_PATH} npx playwright install chromium"
                    } else {
                        echo "Chromium browser already installed, skipping download."
                    }
                    
                    if (params.RUN_ALL_BROWSERS) {
                        if (params.FORCE_BROWSER_DOWNLOAD || firefoxExists == 'false') {
                            echo "Installing Firefox browser..."
                            sh "PLAYWRIGHT_BROWSERS_PATH=${env.PLAYWRIGHT_BROWSERS_PATH} npx playwright install firefox"
                        } else {
                            echo "Firefox browser already installed, skipping download."
                        }
                        
                        if (params.FORCE_BROWSER_DOWNLOAD || webkitExists == 'false') {
                            echo "Installing WebKit browser..."
                            sh "PLAYWRIGHT_BROWSERS_PATH=${env.PLAYWRIGHT_BROWSERS_PATH} npx playwright install webkit"
                        } else {
                            echo "WebKit browser already installed, skipping download."
                        }
                    }
                }
            }
        }

        stage('Run Playwright Tests') {
            steps {
                script {
                    try {
                        def browserProjects = params.RUN_ALL_BROWSERS ? '' : '--project=chromium'
                        sh "PLAYWRIGHT_BROWSERS_PATH=${env.PLAYWRIGHT_BROWSERS_PATH} npx playwright test ${browserProjects} --reporter=html,junit"
                    } catch (Exception e) {
                        // We'll capture test failures but continue the pipeline
                        echo "Tests failed but continuing to generate reports: ${e.getMessage()}"
                        currentBuild.result = 'UNSTABLE'
                    } finally {
                        // Force report generation if tests crashed badly
                        echo "Ensuring report is generated even if tests crashed..."
                        // sh "npx playwright show-report || true"
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