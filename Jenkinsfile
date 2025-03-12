pipeline {
    agent any

    environment {
        NODEJS_HOME = '/usr/local/bin'
        PATH = "${NODEJS_HOME}:${PATH}"
        PLAYWRIGHT_BROWSERS_PATH = "${HOME}/.cache/ms-playwright"
    }

    parameters {
        choice(name: 'BRANCH_NAME', choices: ['main', 'dev', 'master', 'feature-branch'], description: 'Select the Git branch to build')
        booleanParam(name: 'RUN_ALL_BROWSERS', defaultValue: false, description: 'Run tests in all browsers')
        booleanParam(name: 'FORCE_BROWSER_DOWNLOAD', defaultValue: false, description: 'Force browser download')
    }

    options {
        timeout(time: 15, unit: 'MINUTES')
        disableConcurrentBuilds()
    }

    stages {
        stage('Cleanup') {
            steps {
                script {
                    echo "🧹 Cleaning up old reports and artifacts..."
                    sh 'rm -rf playwright-report/ test-results/ artifacts/ *.zip || true'
                }
            }
        }

        stage('Checkout Code') {
            steps {
                checkout([
                    $class: 'GitSCM',
                    branches: [[name: "${params.BRANCH_NAME}"]],
                    userRemoteConfigs: [[url: 'https://github.com/vurvn/Playwright-Automated-Tests.git']],
                    extensions: [[$class: 'CleanBeforeCheckout']]
                ])
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Install Playwright Browsers') {
            steps {
                script {
                    sh "sudo mkdir -p ${env.PLAYWRIGHT_BROWSERS_PATH}"
                    sh "sudo chown -R jenkins:jenkins ${env.PLAYWRIGHT_BROWSERS_PATH}"
                    
                    def isInstalled = { browser -> sh(script: "[[ -d '${env.PLAYWRIGHT_BROWSERS_PATH}/${browser}-*' ]] && echo 'true' || echo 'false'", returnStdout: true).trim() }
                    
                    if (params.FORCE_BROWSER_DOWNLOAD || isInstalled('chromium') == 'false') {
                        sh "npx playwright install chromium"
                    }
                    
                    if (params.RUN_ALL_BROWSERS) {
                        ['firefox', 'webkit'].each { browser ->
                            if (params.FORCE_BROWSER_DOWNLOAD || isInstalled(browser) == 'false') {
                                sh "npx playwright install ${browser}"
                            }
                        }
                    }
                }
            }
        }

        stage('Run Playwright Tests') {
            steps {
                script {
                    catchError(buildResult: 'UNSTABLE', stageResult: 'FAILURE') {
                        def browserProjects = params.RUN_ALL_BROWSERS ? '' : '--project=chromium'
                        sh "npx playwright test ${browserProjects} --reporter=html,junit"
                    }
                }
            }
        }
    }

    post {
        always {
            script {
                sh 'mkdir -p playwright-report || true'
                junit(testResults: 'playwright-report/*.xml', allowEmptyResults: true)
                sh 'mkdir -p artifacts && zip -r artifacts/playwright-report.zip playwright-report || true'
                archiveArtifacts artifacts: 'artifacts/playwright-report.zip', fingerprint: true, allowEmptyArchive: false
                sh 'rm -rf node_modules playwright-report || true'
            }
        }
        success { echo "✅ Build completed successfully!" }
        unstable { echo "⚠️ Tests failed but reports were generated!" }
        failure { echo "❌ Build failed! Check logs for details." }
    }
}
