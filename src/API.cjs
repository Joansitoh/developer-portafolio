const express = require("express");
const { chromium } = require("playwright");

const app = express();

app.get("/screenshot", async (req, res) => {
  const url = req.query.url;

  let browser = await chromium.launch();
  let page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 1080 });
  await page.goto(url);
  const screenshot = await page.screenshot({
    path: `nyt-playwright-chromium.png`,
  });
  await browser.close();

  res.set("Content-Type", "image/png");
  res.send(screenshot);
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
