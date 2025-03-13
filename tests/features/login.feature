Feature: User Login Functionality
  As a user
  I want to test all login functionality
  So that I can ensure the application is working correctly

  Background: 
    Given I open the login page

  Scenario: Successful login with valid credentials
    When I enter username "student" and password "Password123"
    And I click the login button
    Then I should see the welcome message
    And The URL should contain "practicetestautomation.com/logged-in-successfully"
    And The page should contain text "Congratulations" or "successfully logged in"
    And The Log out button should be visible

  Scenario: Login with incorrect password
    When I enter username "student" and password "incorrectPassword"
    And I click the login button
    Then I should see an error message "Your password is invalid!"

  Scenario: Login with incorrect username
    When I enter username "incorrectUser" and password "Password123"
    And I click the login button
    Then I should see an error message "Your username is invalid!"

  Scenario: Login with empty username
    When I enter username "" and password "Password123"
    And I click the login button
    Then I should see an error message "Your username is invalid!"

  Scenario: Login with empty password
    When I enter username "student" and password ""
    And I click the login button
    Then I should see an error message "Your password is invalid!"

  Scenario: Login with empty credentials
    When I enter username "" and password ""
    And I click the login button
    Then I should see an error message "Your username is invalid!"

  Scenario: Login with special characters in username
    When I enter username "student@#$%" and password "Password123"
    And I click the login button
    Then I should see an error message "Your username is invalid!"

  Scenario: Login with special characters in password
    When I enter username "student" and password "@#$%^&*"
    And I click the login button
    Then I should see an error message "Your password is invalid!"

  Scenario: Login with SQL injection attempt in username
    When I enter username "' OR '1'='1" and password "Password123"
    And I click the login button
    Then I should see an error message "Your username is invalid!"

  Scenario: Login with XSS attempt in username
    When I enter username "<script>alert('xss')</script>" and password "Password123"
    And I click the login button
    Then I should see an error message "Your username is invalid!"
