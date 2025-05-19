Feature: User Login Functionality
  As a user of the practice test automation website
  I want to test all login functionality
  So that I can ensure the application handles authentication correctly

  Background: 
    Given I am on the login page

  # Happy Path Scenarios
  @positive
  Scenario: Successful login with valid credentials
    When I enter valid username "student"
    And I enter valid password "Password123"
    And I submit the login form
    Then I should see a success message
    And I should be redirected to "practicetestautomation.com/logged-in-successfully"
    And the page should display "Congratulations" or "successfully logged in"
    And the logout option should be available

  # Invalid Credentials Scenarios
  @negative @credentials
  Scenario: Login with incorrect password
    When I enter valid username "student"
    And I enter invalid password "incorrectPassword"
    And I submit the login form
    Then I should see an error indicating "Your password is invalid!"

  @negative @credentials
  Scenario: Login with incorrect username
    When I enter invalid username "incorrectUser"
    And I enter valid password "Password123"
    And I submit the login form
    Then I should see an error indicating "Your username is invalid!"

  # Empty Field Scenarios
  @negative @empty-fields
  Scenario: Login with empty username
    When I enter empty username ""
    And I enter valid password "Password123"
    And I submit the login form
    Then I should see an error indicating "Your username is invalid!"

  @negative @empty-fields
  Scenario: Login with empty password
    When I enter valid username "student"
    And I enter empty password ""
    And I submit the login form
    Then I should see an error indicating "Your password is invalid!"

  @negative @empty-fields
  Scenario: Login with empty credentials
    When I enter empty username ""
    And I enter empty password ""
    And I submit the login form
    Then I should see an error indicating "Your username is invalid!"

  # Special Characters Scenarios
  @negative @special-chars
  Scenario: Login with special characters in username
    When I enter "special characters" username "student@#$%"
    And I enter valid password "Password123"
    And I submit the login form
    Then I should see an error indicating "Your username is invalid!"

  @negative @special-chars
  Scenario: Login with special characters in password
    When I enter valid username "student"
    And I enter "special characters" password "@#$%^&*"
    And I submit the login form
    Then I should see an error indicating "Your password is invalid!"

  # Security Test Scenarios
  @negative @security
  Scenario: Login with SQL injection attempt
    When I enter "special characters" username "' OR '1'='1"
    And I enter valid password "Password123"
    And I submit the login form
    Then I should see an error indicating "Your username is invalid!"

  @negative @security
  Scenario: Login with XSS attempt
    When I enter "special characters" username "<script>alert('xss')</script>"
    And I enter valid password "Password123"
    And I submit the login form
    Then I should see an error indicating "Your username is invalid!"
