const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());
const puppeteerAfp = require("puppeteer-afp");
const axios = require("axios");
const fs = require("fs");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}


//-----------------------------------------
async function parse() {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    hasTouch: true,
    args: [
      "--no-sandbox",
      "--start-maximized",
      "--disable-notifications"
      
    ],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 937 });
  await page.setDefaultNavigationTimeout(120000);
  const cloakedPage = puppeteerAfp(page);
  let data;


  try {
    await cloakedPage.goto(
      "https://coinmarketcap.com/new/"
    );
  } catch (e) {
    console.log(e);
    await cloakedPage.close();
    await browser.close();
    return;
  }

  await sleep(getRandomInt(3000));

  await page.evaluate(() => {
      data = document.querySelectorAll('.sc-1teo54s-0')
  })

  await sleep(getRandomInt(800000));

}


async function start() {
  try {
    await parse();
  } catch (e) {
    console.log(e);
  }
}

start()