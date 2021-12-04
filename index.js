const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());
const puppeteerAfp = require("puppeteer-afp");
const axios = require("axios");
const fs = require("fs");
const { info } = require("console");

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

  let token = {}; // здесь хранится информация о токенах

  for (let i = 0; i < 3; i++) {
    //data.length
    let token_response = await allAboutTokens(data[i]);
    await sleep(1000);
    token[token_response["название"]] = token_response;
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
    let total_supply

    try {
      total_supply = await page.evaluate(() => {
        return document.querySelectorAll(".maxSupplyValue")[1].textContent;
      });
    } catch (error) {
      total_supply='No Data'
    }
    
    let main_chain = await page.evaluate(() => {
      return document.querySelector(".mainChainTitle").textContent;
    });
    let main_contract = await page.evaluate(() => {
      let result =
        document.querySelector(".mainChainAddress").parentElement.href;

      if (result.includes("harmony")) {
        result =
          "one" +
          document
            .querySelector(".mainChainAddress")
            .parentElement.href.split("one")[1];
      } else if (result.includes("solana")) {
        result = document
          .querySelector(".mainChainAddress")
          .parentElement.href.split("token/")[1];
      } else {
        result =
          "0x" +
          document
            .querySelector(".mainChainAddress")
            .parentElement.href.split("0x")[1];
      }

      return result;
    });

    let max_token_price;
    try {
      max_token_price = await page.evaluate(() => {
        document.querySelectorAll(".dDXPcp")[1].click();

        return document
          .querySelectorAll(".sc-16r8icm-0 .fmPyWa tr td")[17]
          .innerText.split("\n")[0]
          .replace("$", "");
      });
    } catch (error) {
      max_token_price = "Нет данных";
    }

    let min_token_price;
    try {
      min_token_price = await page.evaluate(() => {
        return document
          .querySelectorAll(".sc-16r8icm-0 .fmPyWa tr td")[18]
          .innerText.split("\n")[0]
          .replace("$", "");
      });
    } catch (error) {
      min_token_price = "No Data";
    }

    if ((max_token_price == "No Data") | (min_token_price == "No Data")) {
    } else {
      let percent_all_time =
        Math.round(parseFloat(max_token_price) / parseFloat(min_token_price)) +
        "x";
      let percent_current =
        Math.round(parseFloat(token_price) / parseFloat(min_token_price)) + "x";

      min_token_price = "$" + min_token_price;
      token_price = "$" + token_price + " (" + percent_current + ")";
      max_token_price = "$" + max_token_price + " (" + percent_all_time + ")";
    }

    let twitter_ext = {};
    let twitter
    
    try {

      await page.hover(
        "#__next > div > div > div.sc-57oli2-0.comDeo.cmc-body-wrapper > div > div.sc-16r8icm-0.eMxKgr.container > div.n78udj-0.jskEGI > div > div.sc-16r8icm-0.hMKivi.linksSection > div > div.sc-16r8icm-0.sc-10up5z1-1.eUVvdh > ul > li:nth-child(3) > button"
      );
  
      await sleep(1000);
  
      twitter = await page.evaluate(() => {
        let array = document.querySelectorAll(".tippy-content ul li");
        let result;
        array.forEach((element) => {
          if (element.innerText.includes("twitter")) {
            result = element.children[0].href;
          } else {
            result = "No Data";
          }
        });
        return result;
      });
  
      await cloakedPage.goto(twitter);
  
      await sleep(2000);
     
  
      twitter_ext = await page.evaluate(() => {
        let twitter_ext = {};
        twitter_ext["количество читателей"] = document.querySelector(
          "#react-root > div > div > div.css-1dbjc4n.r-18u37iz.r-13qz1uu.r-417010 > main > div > div > div > div.css-1dbjc4n.r-14lw9ot.r-jxzhtn.r-1ljd8xs.r-13l2t4g.r-1phboty.r-1jgb5lz.r-11wrixw.r-61z16t.r-1ye8kvj.r-13qz1uu.r-184en5c > div > div:nth-child(2) > div > div > div:nth-child(1) > div > div.css-1dbjc4n.r-13awgt0.r-18u37iz.r-1w6e6rj > div:nth-child(2) > a > span.css-901oao.css-16my406.r-18jsvk2.r-poiln3.r-b88u0q.r-bcqeeo.r-qvutc0 > span"
        ).innerText;
  
        twitter_ext["количество твитов"] = document.querySelector(
          "#react-root > div > div > div.css-1dbjc4n.r-18u37iz.r-13qz1uu.r-417010 > main > div > div > div > div.css-1dbjc4n.r-14lw9ot.r-jxzhtn.r-1ljd8xs.r-13l2t4g.r-1phboty.r-1jgb5lz.r-11wrixw.r-61z16t.r-1ye8kvj.r-13qz1uu.r-184en5c > div > div.css-1dbjc4n.r-aqfbo4.r-gtdqiz.r-1gn8etr.r-1g40b8q > div.css-1dbjc4n.r-1loqt21.r-136ojw6 > div > div > div > div > div.css-1dbjc4n.r-16y2uox.r-1wbh5a2.r-1pi2tsx.r-1777fci > div > div"
        ).innerText;
  
          twitter_pinned_entry = {}
          twitter_pinned_entry['Содержание'] = document.querySelectorAll('.css-901oao.r-18jsvk2.r-37j5jr.r-a023e6.r-16dba41.r-rjixqe.r-bcqeeo.r-bnwqim.r-qvutc0')[0].innerText
  
          twitter_pinned_entry['количество лайков'] = document.querySelectorAll('div:nth-child(3) > div > div > div.css-1dbjc4n.r-xoduu5.r-1udh08x > span > span > span')[0].innerText
  
          twitter_pinned_entry['количество комментариев'] = document.querySelectorAll('div:nth-child(1) > div > div > div.css-1dbjc4n.r-xoduu5.r-1udh08x > span > span > span')[0].innerText
  
          twitter_pinned_entry['количество ретвитов'] = document.querySelectorAll('div:nth-child(2) > div > div > div.css-1dbjc4n.r-xoduu5.r-1udh08x > span > span > span')[0].innerText[0].innerText
          twitter_ext['Закрепленная запись'] = twitter_pinned_entry
        return twitter_ext;
      });
      console.log(twitter_ext);

    } catch (error) {
      twitter='No Data'
      twitter_ext = 'No Data'
    }
    

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
      "twitter link": twitter,
      "twitter info": twitter_ext,
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
