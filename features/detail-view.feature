Feature: Star Wars API Explorer Detail View
  As a user
  I want to see detailed information about a specific item
  So that I can learn more about it

  Background:
    Given I am on the landing page
    When I click on the "People" category card
    And I click on the first item in the list

  Scenario: Display item details
    Then I should see a detail wrapper with two columns
    And I should see the detail content section
    And I should see the detail image section
    And the detail content should contain item properties

  Scenario: Navigate back to list
    When I click the back button
    Then I should be on the list screen

  Scenario: Image display
    Then I should see an image or a loading message in the image section
