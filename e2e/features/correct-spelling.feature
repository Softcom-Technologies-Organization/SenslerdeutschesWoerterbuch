Feature: Find the correct spelling of a word
  As a visitor
  I want to search for a partial word
  So that I can see how it is correctly spelled
  
  Background:
    Given I am on the landing page
  
  Scenario: Fuzzy search
    When I type "hapera" into the search bar
    Then I want to see "Häppera" in the results
    
  Scenario: Searching in the description
    When I type "Erdbeere" into the search bar
    Then I want to see "Häppöri" in the results