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

  for (let i = 0; i < 4; i++) {
    //data.length
    let token_response = await allAboutTokens(data[i]);
    await sleep(1000);
    token[token_response['название']]=token_response;
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
    let token_price = await page.evaluate(() => {
      return document
        .querySelector(".sc-16r8icm-0 .fmPyWa tr td")
        .innerText.replace("$", "");
    });
    let market_cap = await page.evaluate(() => {
      return document.querySelector(".statsValue").textContent;
    });
    let total_supply = await page.evaluate(() => {
      return document.querySelectorAll(".maxSupplyValue")[1].textContent;
    });
    let main_chain = await page.evaluate(() => {
      return document.querySelector(".mainChainTitle").innerText;
    });
    let main_contract = await page.evaluate(() => {
      return (
        "0x" +
        document
          .querySelector(".mainChainAddress")
          .parentElement.href.split("0x")[1]
      );
    });

    let max_token_price = await page.evaluate(() => {
      document.querySelectorAll(".dDXPcp")[1].click()

      return document
        .querySelectorAll(".sc-16r8icm-0 .fmPyWa tr td span")[8]
        .innerText.replace("$", "");
    });

    let min_token_price = await page.evaluate(() => {
      return document
        .querySelectorAll(".sc-16r8icm-0 .fmPyWa tr td span")[11]
        .innerText.replace("$", "");
    });

    let percent_all_time =
      Math.round(
        (parseFloat(max_token_price) / parseFloat(min_token_price)) * 100
      ) + "%";
    let percent_current =
      Math.round(
        (parseFloat(token_price) / parseFloat(min_token_price)) * 100
      ) + "%";

    min_token_price = "$" + min_token_price;
    token_price = "$" + token_price + " (" + percent_current + ")";
    max_token_price = "$" + max_token_price + " (" + percent_all_time + ")";

    token_response = {
      название: name,
      символ: token_symbol,
      цена: token_price,
      "максимальная цена": max_token_price,
      "минимальная цена": min_token_price,
      капитализация: market_cap,
      "количество токенов": total_supply,
      сеть: main_chain,
      контракт: main_contract,
    };

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
