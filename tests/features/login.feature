Feature: User Login

  Scenario: Successful login
    Given I open the login page
    When I enter username "student" and password "Password123"
    And I click the login button
    Then I should see the welcome message
    And The URL should contain "practicetestautomation.com/logged-in-successfully/"
    And The page should contain text "Congratulations" or "successfully logged in"
    And The Log out button should be visible

  Scenario: Login with incorrect password
    Given I open the login page
    When I enter username "student" and password "WrongPassword"
    And I click the login button
    Then I should see an error message "Your password is invalid!"

  Scenario: Login with incorrect username
    Given I open the login page
    When I enter username "wrongUser" and password "Password123"
    And I click the login button
    Then I should see an error message "Your username is invalid!"

  Scenario: Login with empty credentials
    Given I open the login page
    When I enter username "" and password ""
    And I click the login button
    Then I should see an error message "Your username is invalid!"
