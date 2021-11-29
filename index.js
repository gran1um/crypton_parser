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
    args: ["--no-sandbox", "--start-maximized", "--disable-notifications"],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 937 });
  await page.setDefaultNavigationTimeout(120000);
  const cloakedPage = puppeteerAfp(page);

  try {
    await cloakedPage.goto("https://coinmarketcap.com/new/");
  } catch (e) {
    console.log(e);
    await cloakedPage.close();
    await browser.close();
    return;
  }

  await sleep(2000);

  let data;
  data = await page.evaluate(() => {
    let array = document.querySelectorAll(".sc-1teo54s-0");
    let result = [];
    array.forEach((element, index) => {
      result[index] = element.parentElement.href;
    });
    return result;
  });

  console.log(data);

  await sleep(getRandomInt(800000));
}

async function parse_pages(data) {
  let pages;

  data.forEach((element) => {
    element.parentElement.click();
    sleep(2000);
    console.log(pages);
  });
}

async function start() {
  try {
    await parse();
  } catch (e) {
    console.log(e);
  }
}

start();
