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

  await sleep(1000);

  let data;
  data = await page.evaluate(() => {
    let array = document.querySelectorAll(".sc-1teo54s-0");
    let result = [];
    array.forEach((element, index) => {
      result[index] = element.parentElement.href;
    });
    return result;
  });

  await sleep(1000);

  let token = {}; // =десь хранится информация о токенах

  for (let i = 3; i < 4; i++) {
    //data.length
    let token_response = await allAboutTokens(data[i]);
    await sleep(1000);
    token = token_response;
    // console.log(token);
  }


  console.log(token);

  await sleep(getRandomInt(800000));

  async function allAboutTokens(url) {

    let token_response = {};
    await cloakedPage.goto(url);
    await sleep(1000);
    let name = await page.evaluate(() => {
      return document.querySelector(".jCInrl").textContent;
    });
    let token_symbol = await page.evaluate(() => {
      return document.querySelector(".nameSymbol").textContent;
    });
    let price = await page.evaluate(() => {
      return document.querySelector(".priceValue").textContent;
    });
    let market_cap = await page.evaluate(() => {
      return document.querySelector(".statsValue").textContent;
    });
    let total_supply = await page.evaluate(() => {
      return document.querySelectorAll(".maxSupplyValue")[1].textContent;
    });
    let main_contract = await page.evaluate(() => {
      return document.querySelector(".mainChainAddress").parentElement.href.split('/token/')[1];
    });
   

    token_response[name] = { 'название': name, 'символ':token_symbol, "цена":price , "капитализация":market_cap, "количество токенов":total_supply, "контракт":main_contract};

    // console.log(token_response);
    await sleep(1000);
    return token_response;
  }
}

async function start() {
  try {
    await parse();
  } catch (e) {
    console.log(e);
  }
}

start();
