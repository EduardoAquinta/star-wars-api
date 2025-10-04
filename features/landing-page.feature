Feature: Star Wars API Explorer Landing Page
  As a user
  I want to see the landing page with category options
  So that I can explore different Star Wars data

  Background:
    Given I am on the landing page

  Scenario: Display landing page header
    Then I should see the title "Star Wars API Explorer"
    And I should see the subtitle "Explore the Star Wars Universe"

  Scenario: Display all category cards
    Then I should see 6 category cards
    And I should see a category card for "People"
    And I should see a category card for "Films"
    And I should see a category card for "Planets"
    And I should see a category card for "Species"
    And I should see a category card for "Starships"
    And I should see a category card for "Vehicles"

  Scenario: Click on a category card
    When I click on the "People" category card
    Then I should be on the list screen
    And I should see the list title "people"

  Scenario: Navigate to home from title
    When I click on the "Films" category card
    And I click on the page title
    Then I should be on the landing screen
