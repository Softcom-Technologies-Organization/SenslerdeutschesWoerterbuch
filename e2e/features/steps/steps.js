const { Given, When, Then } = require("@cucumber/cucumber");
const { chromium, expect } = require("@playwright/test");

let searchField;

Given("I am on the landing page", async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  this.page = await context.newPage();
  await this.page.goto("https://senslerdeutsches-woerterbuch.ch");
  this.searchField = this.page.getByRole("textbox", { name: "Suechi" });
});

When('I type "hapera" into the search bar', async () => {
  await expect(this.searchField).toBeVisible();
  await this.searchField.fill("häpera");
  await this.searchField.press("Enter");
});

Then('I want to see "Häppera" in the results', async () => {
  await expect(this.page.getByRole("link", { name: "Häppera" })).toBeVisible();
});

When('I type "Erdbeere" into the search bar', async () => {
  await expect(this.searchField).toBeVisible();
  await this.searchField.fill("Erdbeere");
  await this.searchField.press("Enter");
});

Then('I want to see "Häppöri" in the results', async () => {
  await expect(
    this.page.getByRole("link", { name: "Häppöri" })
  ).toBeVisible();
});

When('I type "Häppera" into the search bar', async () => {
  await expect(this.searchField).toBeVisible();
  await this.searchField.fill("Häppera");
  await this.searchField.press("Enter");
});

Then('I want to see as first result the word "Häppera"', async () => {
  await expect(
    this.page.getByRole("link", { name: "Häppera" })
  ).toBeVisible();
});
