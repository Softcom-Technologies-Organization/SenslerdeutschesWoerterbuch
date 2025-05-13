Feature: Verify if a word exists
  As a visitor
  I want to search for a specific word
  So that I can verify if it exists or not
  
  Scenario: Exact sarch
    Given I am on the landing page
    When I type "Häppera" into the search bar
    Then I want to see as first result the word "Häppera"