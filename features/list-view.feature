Feature: Star Wars API Explorer List View
  As a user
  I want to see a list of items in a category
  So that I can browse and select specific items

  Background:
    Given I am on the landing page
    When I click on the "People" category card

  Scenario: Display list of items
    Then I should see a list of items
    And each item should have a thumbnail image
    And each item should have a name

  Scenario: Navigate back to categories
    When I click the back button
    Then I should be on the landing screen

  Scenario: Click on an item
    When I click on the first item in the list
    Then I should be on the detail screen
    And I should see item details

  Scenario: Pagination controls
    Then I should see pagination controls
    And I should see a "Previous" button
    And I should see a "Next" button
    And I should see page information
