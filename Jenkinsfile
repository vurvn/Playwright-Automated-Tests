pipeline {
    agent any

    environment {
        NODEJS_HOME = '/usr/local/bin'
        PATH = "${NODEJS_HOME}:${PATH}"
    }

    parameters {
        choice(name: 'BRANCH_NAME', choices: ['main', 'dev', 'master', 'feature-branch'], description: 'Select the Git branch to build')
        booleanParam(name: 'RUN_ALL_BROWSERS', defaultValue: false, description: 'Run tests in all browsers')
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
                sh 'npm ci'// Uses package-lock.json for deterministic builds
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
                echo "📜 Archive Playwright Report..."
                sh 'zip -r playwright-report.zip playwright-report || true' // Avoid failure if folder doesn't exist
                archiveArtifacts artifacts: 'playwright-report.zip', fingerprint: true
            }
        }
        success { echo "✅ Build completed successfully!" }
        unstable { echo "⚠️ Tests failed but reports were generated!" }
        failure { echo "❌ Build failed! Check logs for details." }
    }
}
