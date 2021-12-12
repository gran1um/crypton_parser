const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());
const puppeteerAfp = require("puppeteer-afp");
const axios = require("axios");
const fs = require("fs");
const { response } = require("express");
const rp = require("request-promise");
const { Telegraf } = require("telegraf");
const { send } = require("process");
require("dotenv").config();

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

//-----------------------------------------

let current_last_file = "bot_is_booting.html";

//------------main function-----------
async function parse() {
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: null,
    hasTouch: true,
    args: ["--no-sandbox", "--start-maximized", "--disable-notifications"],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 937 });
  await page.setDefaultNavigationTimeout(120000);
  const cloakedPage = puppeteerAfp(page);
  let token = {};
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

  await sleep(1000);

  for (let i = 0; i < data.length; i++) {
    let token_response = await allAboutTokens(data[i]);
    await sleep(1000);
    token[token_response["название"]] = token_response;
  }

  return token;

  //--------------------functions-----------------------------
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
    let total_supply;

    try {
      total_supply = await page.evaluate(() => {
        return document.querySelectorAll(".maxSupplyValue")[1].textContent;
      });
    } catch (error) {
      total_supply = "No Data";
    }

    let main_chain;
    let main_contract;
    try {
      main_chain = await page.evaluate(() => {
        return document.querySelector(".mainChainTitle").textContent;
      });
      main_contract = await page.evaluate(() => {
        let result =
          document.querySelector(".mainChainAddress").parentElement.href;

        if (result.includes("harmony")) {
          result =
            "one" +
            document
              .querySelector(".mainChainAddress")
              .parentElement.href.split("one")[1];
        } else if (result.includes("solscan.io")) {
          if (result.includes("token")) {
            result = document
              .querySelector(".mainChainAddress")
              .parentElement.href.split("token/")[1];
          } else if (result.includes("account")) {
            result = document
              .querySelector(".mainChainAddress")
              .parentElement.href.split("account/")[1];
          } else result = "No Data";
        } else {
          result =
            "0x" +
            document
              .querySelector(".mainChainAddress")
              .parentElement.href.split("0x")[1];
        }
        return result;
      });
    } catch (error) {
      main_chain = "Exchange only";
      main_contract = "Has no contract";
    }

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
    let twitter;
    let about_token;
    try {
      await page.hover(
        "#__next > div > div > div.sc-57oli2-0.comDeo.cmc-body-wrapper > div > div.sc-16r8icm-0.eMxKgr.container > div.n78udj-0.jskEGI > div > div.sc-16r8icm-0.hMKivi.linksSection > div > div.sc-16r8icm-0.sc-10up5z1-1.eUVvdh > ul > li:nth-child(3) > button"
      );

      await sleep(2000);

      twitter = await page.evaluate(() => {
        let array = document.querySelectorAll(".tippy-content ul li");
        let result;
        for (let i = 0; i < 5; i++) {
          if (array[i].innerText.includes("twitter.com")) {
            if (array[i].children[0].href.includes("/status")) {
              result = array[i].children[0].href.split("/status")[0];
            } else result = array[i].children[0].href;

            break;
          } else {
            result = "No Data";
          }
        }
        return result;
      });

      console.log(twitter);

      await cloakedPage.goto(twitter);

      await sleep(3000);

      try {
        twitter_ext = await page.evaluate(() => {
          let twitter_ext = {};
          twitter_ext["количество читателей"] = document.querySelector(
            "#react-root > div > div > div.css-1dbjc4n.r-18u37iz.r-13qz1uu.r-417010 > main > div > div > div > div.css-1dbjc4n.r-14lw9ot.r-jxzhtn.r-1ljd8xs.r-13l2t4g.r-1phboty.r-1jgb5lz.r-11wrixw.r-61z16t.r-1ye8kvj.r-13qz1uu.r-184en5c > div > div:nth-child(2) > div > div > div:nth-child(1) > div > div.css-1dbjc4n.r-13awgt0.r-18u37iz.r-1w6e6rj > div:nth-child(2) > a > span.css-901oao.css-16my406.r-18jsvk2.r-poiln3.r-b88u0q.r-bcqeeo.r-qvutc0 > span"
          ).innerText;

          twitter_ext["количество твитов"] = document.querySelector(
            "#react-root > div > div > div.css-1dbjc4n.r-18u37iz.r-13qz1uu.r-417010 > main > div > div > div > div.css-1dbjc4n.r-14lw9ot.r-jxzhtn.r-1ljd8xs.r-13l2t4g.r-1phboty.r-1jgb5lz.r-11wrixw.r-61z16t.r-1ye8kvj.r-13qz1uu.r-184en5c > div > div.css-1dbjc4n.r-aqfbo4.r-gtdqiz.r-1gn8etr.r-1g40b8q > div.css-1dbjc4n.r-1loqt21.r-136ojw6 > div > div > div > div > div.css-1dbjc4n.r-16y2uox.r-1wbh5a2.r-1pi2tsx.r-1777fci > div > div"
          ).innerText;

          twitter_pinned_entry = {};
          twitter_pinned_entry["Содержание"] = document.querySelectorAll(
            ".css-901oao.r-18jsvk2.r-1qd0xha.r-a023e6.r-16dba41.r-rjixqe.r-bcqeeo.r-bnwqim.r-qvutc0"
          )[0].innerText;
          try {
            twitter_pinned_entry["Содержание"] = twitter_pinned_entry[
              "Содержание"
            ].replace(/\n/g, " ");
          } catch (error) {
            twitter_pinned_entry["Содержание"] = "-";
          }

          twitter_pinned_entry["количество лайков"] = document.querySelectorAll(
            "div:nth-child(3) > div > div > div.css-1dbjc4n.r-xoduu5.r-1udh08x > span > span > span"
          )[0].innerText;

          twitter_pinned_entry["количество комментариев"] =
            document.querySelectorAll(
              "div:nth-child(1) > div > div > div.css-1dbjc4n.r-xoduu5.r-1udh08x > span > span > span"
            )[0].innerText;

          twitter_pinned_entry["количество ретвитов"] =
            document.querySelectorAll(
              "div:nth-child(2) > div > div > div.css-1dbjc4n.r-xoduu5.r-1udh08x > span > span > span"
            )[0].innerText;

          let temp = document.querySelector("time").dateTime.split("T")[0];

          twitter_pinned_entry["дата публикации"] =
            temp.split("-")[2] +
            "-" +
            temp.split("-")[1] +
            "-" +
            temp.split("-")[0];

          twitter_ext["Закрепленная запись"] = twitter_pinned_entry;
          return twitter_ext;
        });
      } catch (e) {
        twitter_ext = "Account is banned or not yet filled";
        about_token = "No Data";
      }

      try {
        about_token = await page.evaluate(() => {
          return document.querySelector(
            "#react-root > div > div > div.css-1dbjc4n.r-18u37iz.r-13qz1uu.r-417010 > main > div > div > div > div.css-1dbjc4n.r-14lw9ot.r-jxzhtn.r-1ljd8xs.r-13l2t4g.r-1phboty.r-1jgb5lz.r-11wrixw.r-61z16t.r-1ye8kvj.r-13qz1uu.r-184en5c > div > div:nth-child(2) > div > div > div:nth-child(1) > div > div:nth-child(3) > div > div"
          ).innerText;
        });
        about_token = about_token.split(/\n/)[0];
      } catch (error) {
        about_token = "No Data";
      }
    } catch (error) {
      try {
        twitter = await page.evaluate(() => {
          let result;
          if (
            document
              .querySelector(
                "#__next > div > div > div.sc-57oli2-0.comDeo.cmc-body-wrapper > div > div.sc-16r8icm-0.eMxKgr.container > div.n78udj-0.jskEGI > div > div.sc-16r8icm-0.hMKivi.linksSection > div > div.sc-16r8icm-0.sc-10up5z1-1.eUVvdh > ul > li:nth-child(3) > a"
              )
              .href.includes("twitter.com")
          ) {
            result = document.querySelector(
              "#__next > div > div > div.sc-57oli2-0.comDeo.cmc-body-wrapper > div > div.sc-16r8icm-0.eMxKgr.container > div.n78udj-0.jskEGI > div > div.sc-16r8icm-0.hMKivi.linksSection > div > div.sc-16r8icm-0.sc-10up5z1-1.eUVvdh > ul > li:nth-child(3) > a"
            ).href;
            return result;
          }
        });
        console.log(twitter);
        await cloakedPage.goto(twitter);

        await sleep(3000);

        twitter_ext = await page.evaluate(() => {
          let twitter_ext = {};

          twitter_ext["количество читателей"] = document.querySelector(
            "#react-root > div > div > div.css-1dbjc4n.r-18u37iz.r-13qz1uu.r-417010 > main > div > div > div > div.css-1dbjc4n.r-14lw9ot.r-jxzhtn.r-1ljd8xs.r-13l2t4g.r-1phboty.r-1jgb5lz.r-11wrixw.r-61z16t.r-1ye8kvj.r-13qz1uu.r-184en5c > div > div:nth-child(2) > div > div > div:nth-child(1) > div > div.css-1dbjc4n.r-13awgt0.r-18u37iz.r-1w6e6rj > div:nth-child(2) > a > span.css-901oao.css-16my406.r-18jsvk2.r-poiln3.r-b88u0q.r-bcqeeo.r-qvutc0 > span"
          ).innerText;

          twitter_ext["количество твитов"] = document.querySelector(
            "#react-root > div > div > div.css-1dbjc4n.r-18u37iz.r-13qz1uu.r-417010 > main > div > div > div > div.css-1dbjc4n.r-14lw9ot.r-jxzhtn.r-1ljd8xs.r-13l2t4g.r-1phboty.r-1jgb5lz.r-11wrixw.r-61z16t.r-1ye8kvj.r-13qz1uu.r-184en5c > div > div.css-1dbjc4n.r-aqfbo4.r-gtdqiz.r-1gn8etr.r-1g40b8q > div.css-1dbjc4n.r-1loqt21.r-136ojw6 > div > div > div > div > div.css-1dbjc4n.r-16y2uox.r-1wbh5a2.r-1pi2tsx.r-1777fci > div > div"
          ).innerText;

          twitter_pinned_entry = {};
          twitter_pinned_entry["Содержание"] = document.querySelectorAll(
            ".css-901oao.r-18jsvk2.r-1qd0xha.r-a023e6.r-16dba41.r-rjixqe.r-bcqeeo.r-bnwqim.r-qvutc0"
          )[0].innerText;

          try {
            twitter_pinned_entry["Содержание"] = twitter_pinned_entry[
              "Содержание"
            ].replace(/\n/g, " ");
          } catch (error) {
            twitter_pinned_entry["Содержание"] = "-";
          }

          twitter_pinned_entry["количество лайков"] = document.querySelectorAll(
            "div:nth-child(3) > div > div > div.css-1dbjc4n.r-xoduu5.r-1udh08x > span > span > span"
          )[0].innerText;

          twitter_pinned_entry["количество комментариев"] =
            document.querySelectorAll(
              "div:nth-child(1) > div > div > div.css-1dbjc4n.r-xoduu5.r-1udh08x > span > span > span"
            )[0].innerText;

          twitter_pinned_entry["количество ретвитов"] =
            document.querySelectorAll(
              "div:nth-child(2) > div > div > div.css-1dbjc4n.r-xoduu5.r-1udh08x > span > span > span"
            )[0].innerText;

          let temp = document.querySelector("time").dateTime.split("T")[0];

          twitter_pinned_entry["дата публикации"] =
            temp.split("-")[2] +
            "-" +
            temp.split("-")[1] +
            "-" +
            temp.split("-")[0];

          twitter_ext["Закрепленная запись"] = twitter_pinned_entry;
          return twitter_ext;
        });

        try {
          about_token = await page.evaluate(() => {
            return document.querySelector(
              "#react-root > div > div > div.css-1dbjc4n.r-18u37iz.r-13qz1uu.r-417010 > main > div > div > div > div.css-1dbjc4n.r-14lw9ot.r-jxzhtn.r-1ljd8xs.r-13l2t4g.r-1phboty.r-1jgb5lz.r-11wrixw.r-61z16t.r-1ye8kvj.r-13qz1uu.r-184en5c > div > div:nth-child(2) > div > div > div:nth-child(1) > div > div:nth-child(3) > div > div"
            ).innerText;
          });
          about_token = about_token.split(/\n/)[0];
        } catch (error) {
          about_token = "No Data";
        }
      } catch (error) {
        twitter = "No Data";
        twitter_ext = "No Data";
        about_token = "No Data";
      }
    }

    token_response = {
      название: name,
      символ: token_symbol,
      "о токене": about_token,
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

    await sleep(1000);

    return token_response;
  }
}

async function start() {
  while (true) {
    try {
      let date = new Date();
      let token_info = {};

      let nominations = {};
      token_info = await parse();
      let max_followers = 0;
      let max_market_cap = 0;
      let change_max_min = 0;
      let change_max_current = 0;

      Object.keys(token_info).forEach((element) => {
        let nice_type_max_min;
        try {
          nice_type_max_min = Number(
            token_info[element]["максимальная цена"].split("(")[1].split("x")[0]
          );
        } catch (error) {
          nice_type_max_min = 0;
        }

        let nice_type_max_current;
        try {
          nice_type_max_current =
            Number(
              token_info[element]["максимальная цена"]
                .split("(")[1]
                .split("x")[0]
            ) - Number(token_info[element]["цена"].split("(")[1].split("x")[0]);
        } catch (error) {
          nice_type_max_current = 0;
        }

        let nice_type_follow = nice_type_func(
          token_info[element]["twitter info"]["количество читателей"]
        );

        let nice_type_cap = nice_type_func(
          token_info[element]["капитализация"]
        );

        if (nice_type_follow > max_followers) {
          max_followers = nice_type_follow;
          nominations["max_followers_owner"] = token_info[element]["название"];
        }

        if (nice_type_cap > max_market_cap) {
          max_market_cap = nice_type_cap;
          nominations["max_market_cap_owner"] = token_info[element]["название"];
        }

        if (nice_type_max_min > change_max_min) {
          change_max_min = nice_type_max_min;
          nominations["change_max_min_owner"] = token_info[element]["название"];
        }

        if (nice_type_max_current > change_max_current) {
          change_max_current = nice_type_max_current;
          nominations["change_max_current_owner"] =
            token_info[element]["название"];
        }
      });

      function nice_type_func(elem) {
        let nice_type = 0;
        try {
          if (elem.includes("K")) {
            nice_type = elem.replace("K", "");
            nice_type = Number(nice_type) * 1000;
          } else if (elem.includes("$") || elem.includes(",")) {
            nice_type = elem.replace(/,|\$/g, "");
            nice_type = Number(nice_type);
          } else if (elem.includes("- -")) {
            nice_type = elem.replace("- -", 0);
            nice_type = Number(nice_type);
          } else if (elem.includes(" ")) {
            nice_type = elem.replace(" ", "");
            nice_type = Number(nice_type);
          }
          return nice_type;
        } catch (error) {
          return 0;
        }
      }

      console.log(nominations);

      await sleep(3000);
      let data = `<!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta http-equiv="X-UA-Compatible" content="IE=edge" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <link
            href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css"
            rel="stylesheet"
            integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3"
            crossorigin="anonymous"
          />
      
          <title>Crypto Hamster</title>
        </head>
        <body>
          <div style="display: flex; flex-wrap: wrap; justify-content: center; max-width: 3200px">
          <div
          class="card mb-3"
          style="
            width: 600px;
            height: auto;
            margin: 30px;
            border-radius: 10px;
            background: rgba(255, 215, 0);
          "
        >
          <div class="row g-0">
            <div class="col-md-4" style='text-align: center;'>
              <img src="https://i.ibb.co/WkDc1sv/transparent-award-icon-trophy-icon-soccer-icon-5dcdec45a2e790-7969843615737764536673.png" height="200px" alt="..." />
            </div>
            <div class="col-md-8">
              <div class="card-body">
                <h5 class="card-title" style='text-align:center'><b>"KING OF TWITTER"</b></h5>
                <h5 class="card-title">
                <b>${nominations["max_followers_owner"]}</b>
                </h5>
                
                <p class="card-text">
                  This token has the largest Twitter community of any token added today.
                </p>
                <p class="card-text">
                  <b>Number of readers: </b> ${
                    token_info[nominations["max_followers_owner"]][
                      "twitter info"
                    ]["количество читателей"]
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
        <div
          class="card mb-3"
          style="
            width: 600px;
            height: auto;
            margin: 30px;
            border-radius: 10px;
            background: rgba(255, 215, 0);
          "
        >
          <div class="row g-0">
            <div class="col-md-4" style='text-align: center;'>
              <img src="https://i.ibb.co/WkDc1sv/transparent-award-icon-trophy-icon-soccer-icon-5dcdec45a2e790-7969843615737764536673.png" height="200px" alt="..." />
            </div>
            <div class="col-md-8">
              <div class="card-body">
              <h5 class="card-title" style='text-align:center'><b>"BIGGE$T MARKETCAP"</b></h5>
              <h5 class="card-title" ><b>${
                nominations["max_market_cap_owner"]
              }</b></h5>
              
                <p class="card-text">
                  This token has the largest capitalization of all tokens added today.
                </p>
                <p class="card-text">
                  <b>Marketcap: </b> ${
                    token_info[nominations["max_market_cap_owner"]][
                      "капитализация"
                    ]
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
        <div
          class="card mb-3"
          style="
            width: 600px;
            height: auto;
            margin: 30px;
            border-radius: 10px;
            background: rgba(255, 215, 0);
          "
        >
          <div class="row g-0">
            <div class="col-md-4" style='text-align: center;'>
              <img src="https://i.ibb.co/WkDc1sv/transparent-award-icon-trophy-icon-soccer-icon-5dcdec45a2e790-7969843615737764536673.png" height="200px" alt="..." />
            </div>
            <div class="col-md-8">
              <div class="card-body">
              <h5 class="card-title" style='text-align:center'><b>"EXPLOSIVE START"</b></h5>
              <h5 class="card-title" ><b>${
                nominations["change_max_min_owner"]
              }</b></h5>
                <p class="card-text">
                  This token has the the largest number of x's among all tokens added today.
                </p>
                <p class="card-text">
                  <b>Price & x's : </b>${
                    token_info[nominations["change_max_min_owner"]][
                      "максимальная цена"
                    ]
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
        <div
          class="card mb-3"
          style="
            width: 600px;
            height: auto;
            margin: 30px;
            border-radius: 10px;
            background: rgba(255, 215, 0);
          "
        >
          <div class="row g-0">
            <div class="col-md-4" style='text-align: center;'>
              <img src="https://i.ibb.co/WkDc1sv/transparent-award-icon-trophy-icon-soccer-icon-5dcdec45a2e790-7969843615737764536673.png" height="200px" alt="..." />
            </div>
            <div class="col-md-8">
              <div class="card-body">
              <h5 class="card-title" style='text-align:center'><b>"CORRECTION OR SCAM?"</b></h5>
              <h5 class="card-title"><b>${
                nominations["change_max_current_owner"]
              }</b></h5>
                <p class="card-text">
                  This token 
                  has the largest correction from its maximum price (in x's).
                </p>
                <p class="card-text">
                  <b>Current price: </b>${
                    token_info[nominations["change_max_current_owner"]]["цена"]
                  }
                  <br>
                  <b>Max price: </b>${
                    token_info[nominations["change_max_current_owner"]][
                      "максимальная цена"
                    ]
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
        `;

      await sleep(3000);
      try {
        Object.keys(token_info).forEach((element) => {
          if (
            token_info[element]["twitter info"] == "No Data" ||
            token_info[element]["twitter info"] ==
              "Account is banned or not yet filled"
          ) {
            data += `<div
            class="card mb-3"
            style="
              width: 600px;
              height: auto;
              margin: 30px;
              border-radius:10px;
              background: rgba(${getRandomInt(0, 255)}, ${getRandomInt(
              0,
              255
            )}, ${getRandomInt(0, 255)}, 0.4)">
            <div class="row g-0">
              <div class="col-md-12">
                <div class="card-body">
                  <h4 class="card-title" style="margin: 20px 0 40px">
      ${token_info[element]["название"]} (${token_info[element]["символ"]})
    </h4>
    <p class="card-text">
      <b>About token (citation): </b>"${token_info[element]["о токене"]}"
    </p>
    <p class="card-text"><b>Price: </b>${token_info[element]["цена"]}</p>
    <p class="card-text"><b>Max price: </b>${
      token_info[element]["максимальная цена"]
    }</p>
    <p class="card-text"><b>Min price : </b>${
      token_info[element]["минимальная цена"]
    }</p>

    <p class="card-text"><b>Market cap: </b>${
      token_info[element]["капитализация"]
    }</p>

    <p class="card-text"><b>Total Supply: </b>${
      token_info[element]["количество токенов"]
    }</p>

    <p class="card-text">
      <b>Main network: </b>${token_info[element]["сеть"]}
    </p>
    <p class="card-text">
      <b>Contract: </b> ${token_info[element]["контракт"]}
    </p>
    <p class="card-text">
      <b>Twitter link: </b>
      <a
        href="${token_info[element]["twitter link"]}"
        style="color: inherit"
        >${token_info[element]["twitter link"]}</a
      >
    </p>
    <p class="card-text"><b>Twitter info: </b> ${
      token_info[element]["twitter info"]
    }</p>

    <p class="card-text" style="position: absolute;bottom: 0;margin-bottom: 10px;">
      <small class="text-muted">${date.getDate()}.${
              date.getMonth() + 1
            }.${date.getFullYear()}</small>
    </p>
  </div>
</div>
</div></div>`;
          } else {
            data += `<div
                  class="card mb-3"
                  style="
                    width: 600px;
                    height: auto;
                    margin: 30px;
                    border-radius:10px;
                    background: rgba(${getRandomInt(0, 255)}, ${getRandomInt(
              0,
              255
            )}, ${getRandomInt(0, 255)}, 0.4)">
                  <div class="row g-0">
                    <div class="col-md-12">
                      <div class="card-body">
                        <h4 class="card-title" style="margin: 20px 0 40px">
            ${token_info[element]["название"]} (${
              token_info[element]["символ"]
            })
          </h4>
          <p class="card-text">
            <b>About token (citation): </b>"${token_info[element]["о токене"]}"
          </p>
          <p class="card-text"><b>Price: </b>${token_info[element]["цена"]}</p>
          <p class="card-text"><b>Max price: </b>${
            token_info[element]["максимальная цена"]
          }</p>
          <p class="card-text"><b>Min price : </b>${
            token_info[element]["минимальная цена"]
          }</p>

          <p class="card-text"><b>Market cap: </b>${
            token_info[element]["капитализация"]
          }</p>

          <p class="card-text"><b>Total Supply: </b>${
            token_info[element]["количество токенов"]
          }</p>

          <p class="card-text">
            <b>Main network: </b>${token_info[element]["сеть"]}
          </p>
          <p class="card-text">
            <b>Contract: </b> ${token_info[element]["контракт"]}
          </p>
          <p class="card-text">
            <b>Twitter link: </b>
            <a
              href="${token_info[element]["twitter link"]}"
              style="color: inherit"
              >${token_info[element]["twitter link"]}</a
            >
          </p>
          <p class="card-text"><b>Twitter followers: </b> ${
            token_info[element]["twitter info"]["количество читателей"]
          }</p>
          <p class="card-text"><b>Сount of tweets: </b>${
            token_info[element]["twitter info"]["количество твитов"]
          }</p>
          <p class="card-text" style='text-align:center; margin-bottom:20px' >
            <b>PINNED ENTRY</b> <br />
            <b>Content:</b> ${
              token_info[element]["twitter info"]["Закрепленная запись"][
                "Содержание"
              ]
            } <br />
            <b>Likes:</b> ${
              token_info[element]["twitter info"]["Закрепленная запись"][
                "количество лайков"
              ]
            } <br />
            <b>Comments:</b> ${
              token_info[element]["twitter info"]["Закрепленная запись"][
                "количество комментариев"
              ]
            } <br />
            <b>Retweets:</b> ${
              token_info[element]["twitter info"]["Закрепленная запись"][
                "количество ретвитов"
              ]
            } <br />
            
            <b>Publication date :</b> ${
              token_info[element]["twitter info"]["Закрепленная запись"][
                "дата публикации"
              ]
            }
          </p>

          <p class="card-text" style="position: absolute;bottom: 0;margin-bottom: 10px;">
            <small class="text-muted">${date.getDate()}.${
              date.getMonth() + 1
            }.${date.getFullYear()}</small>
          </p>
        </div>
      </div>
    </div></div>`;
          }
        });

        data += "</div></body></html>";
        try {
          current_last_file = `Crypto Ham$ter от ${date.getDate()}.${
            date.getMonth() + 1
          }.${date.getFullYear()}.html`;

          fs.writeFileSync(
            `Crypto Ham$ter от ${date.getDate()}.${
              date.getMonth() + 1
            }.${date.getFullYear()}.html`,
            data
          );
          console.log("complete html doc!");
          await browser.close();
        } catch (e) {
          console.log(e);
          await browser.close();
          await sleep(48 * 60 * 60 * 1000);
        }
      } catch (error) {
        await browser.close();
        await sleep(48 * 60 * 60 * 1000); // error main catch
      }
      await browser.close();
      await sleep(12 * 60 * 60 * 1000);
    } catch (e) {
      console.log(e);
      await browser.close();
      await sleep(48 * 60 * 60 * 1000);
    }
  }
}

start();

const bot = new Telegraf(process.env.BOT_TOKEN);
let count = 0;
bot.start((ctx) => ctx.reply("Hello, check /help!"));

bot.help((ctx) => ctx.reply("Send /hamster"));

bot.command("hamster", async (ctx) => {
  try {
    ctx.telegram.sendDocument(ctx.from.id, {
      source: current_last_file,
      filename: current_last_file,
    });
    count++;
    console.log("html has been send " + count + " times");
  } catch (e) {
    console.log(e);
    ctx.reply(
      "Что-то пошло не так :(" +
        "\n" +
        "Проверь правильность ввода и повтори попытку"
    );
  }
});

let simply_answer = [
  "На каком это языке? ",
  "Не понял :( ",
  "🤷‍♂️",
  "🤕",
  "🤔",
  "😴",
  "🤐",
  "🤯",
];

function randomInteger(min, max) {
  let rand = min - 0.5 + Math.random() * (max - min + 1);
  return Math.round(rand);
}

bot.on("text", async (ctx) => {
  await ctx.reply(simply_answer[randomInteger(0, simply_answer.length - 1)]);
  await ctx.reply("Чтобы понять как со мной общаться используй /help");
});

bot.launch();
