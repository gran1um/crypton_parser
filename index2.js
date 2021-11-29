const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const puppeteerAfp = require('puppeteer-afp');
const axios = require('axios');
const fs = require('fs');
const UsernameGenerator = require('username-generator');
const userAgents = require('top-user-agents');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generatePassword() {
  var length = getRandomInt(8, 20),
    charset = "abcdefghijklmnopqrstuvwxyz-ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
    retVal = "";
  for (var i = 0, n = charset.length; i < length; ++i) {
    retVal += charset.charAt(Math.floor(Math.random() * n));
  }
  return retVal;
}

const proxyList = String(fs.readFileSync('proxy_private.txt')).split("\n");

async function solveRec() {
  let siteKey = '6LeTnxkTAAAAAN9QEuDZRpn90WwKk_R1TRW_g-JC';
  let token = '013dcdca04747d528e9518692380b3ad';
  let resp = await axios.get(`http://rucaptcha.com/in.php?key=${token}&method=userrecaptcha&googlekey=${siteKey}&pageurl=https://www.reddit.com/register/?dest=https%3A%2F%2Fwww.reddit.com%2F`);
  console.log(resp.data);
  let cap = resp.data.split('|')[1];
  console.log('WAIT');
  const check = async () => {
    let resp = await axios.get(`http://rucaptcha.com/res.php?key=${token}&action=get&id=${cap}`);
    if (resp.data === 'CAPCHA_NOT_READY') {
      await sleep(5000);
      return await check();
    } else {
      console.log('SOLVED');
      return resp.data;
    }
  };
  return await check();
}

async function warmup(proxy, browser, page) {
    await sleep(getRandomInt(6000,10000));

    try {
      await page.evaluate(() => {
        document.querySelectorAll('._1_Rq-E5LCS_6JTARElGK12')[0].click();
      });
    } catch (e) {
      console.log(e);
    }

    await sleep(getRandomInt(4000,6000));
    await page.evaluate(() => {
      [...document.querySelectorAll('a._2iuoyPiKHN3kfOoeIQalDT')].find(element => element.textContent === 'View All').click();
    });
    await sleep(getRandomInt(5000,9000));
    if (getRandomInt(1, 5) === 5) {
      await page.evaluate(() => {
        function getRandomInt(min, max) {
          min = Math.ceil(min);
          max = Math.floor(max);
          return Math.floor(Math.random() * (max - min + 1)) + min;
        }

        document.querySelectorAll("._267lcOmg8VvXcoj9O0Q1TB")[getRandomInt(11, 19)].scrollIntoView({
          behavior: "smooth",
          block: "end",
          inline: "nearest"
        });
      });
      await sleep(getRandomInt(5000, 7000));
      await page.evaluate(() => {
        function getRandomInt(min, max) {
          min = Math.ceil(min);
          max = Math.floor(max);
          return Math.floor(Math.random() * (max - min + 1)) + min;
        }

        document.querySelectorAll("._267lcOmg8VvXcoj9O0Q1TB")[getRandomInt(24, 29)].scrollIntoView({
          behavior: "smooth",
          block: "end",
          inline: "nearest"
        });
      });
      await sleep(getRandomInt(5000, 7000));
      await page.evaluate(() => {
        document.querySelectorAll("._267lcOmg8VvXcoj9O0Q1TB")[1].scrollIntoView({
          behavior: "smooth",
          block: "end",
          inline: "nearest"
        });
      });
    }
    await sleep(5000);
    await page.evaluate(() => {
      function getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
      }

      document.querySelectorAll("._3p0xqZowgYYjYMOdinU151")[getRandomInt(0, 11)].click();
    });
    await sleep(getRandomInt(5000, 8000));
    await page.evaluate(() => {
      function getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
      }

      let len = document.querySelectorAll("._267lcOmg8VvXcoj9O0Q1TB").length;
      const select = (len >= 12) ? getRandomInt(0, len - 1) : getRandomInt(0, 11);
      if (len >= 12) {
        document.querySelectorAll("._267lcOmg8VvXcoj9O0Q1TB")[select].scrollIntoView({
          behavior: "smooth",
          block: "end",
          inline: "nearest"
        });
      }
      function sleep(sleepDuration){
        var now = new Date().getTime();
        while(new Date().getTime() < now + sleepDuration){ /* Do nothing */ }
      }
      sleep(getRandomInt(6000,9000));
      document.querySelectorAll("._2ARwkAW45Urhf_fMfAMi5_")[select].setAttribute("target", "");
      document.querySelectorAll("._2ARwkAW45Urhf_fMfAMi5_")[select].click();
    });
    await sleep(getRandomInt(6000,9000));
    await page.reload({ waitUntil: ["networkidle0", "domcontentloaded"] });
    await page.evaluate(() => {
      function getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
      }

      function sleep(sleepDuration){
        var now = new Date().getTime();
        while(new Date().getTime() < now + sleepDuration){ /* Do nothing */ }
      }

      if (document.querySelectorAll("[data-click-id=\"upvote\"]").length > 0) {
        let elements = document.querySelectorAll("._2ARwkAW45Urhf_fMfAMi5_");
        for (let i = 0; i <= getRandomInt(18, 25); i++) {
          let num = getRandomInt(0, 8);
          try {
            if (num <= 2) {
              document.querySelectorAll("[data-click-id=\"upvote\"]")[i * 2].click();
            } else if (num <= 6) {
              document.querySelectorAll("[data-click-id=\"downvote\"]")[i * 2].click();
            }
          } catch (e) {
            console.log(e);
          }
          sleep(getRandomInt(3000,6000));
          if (getRandomInt(1, 10) === 5) {
            [...document.querySelectorAll('.icon-save')][i].parentElement.parentElement.click();
            sleep(getRandomInt(3000,6000));
          }
        }
      }
    });
    console.log('warmup ok');
}

async function reg(proxy) {
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: null,
    hasTouch: true,
    args: ['--no-sandbox', '--start-maximized', '--disable-notifications', '--proxy-server=' + proxy.split('@')[1]]
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 937});
  await page.authenticate({
    username: (proxy.split('@')[0]).split(':')[0],
    password: (proxy.split('@')[0]).split(':')[1]
  });

  await page.setDefaultNavigationTimeout(120000);

  const cloakedPage = puppeteerAfp(page);
  await cloakedPage.setUserAgent(userAgents[getRandomInt(0, userAgents.length - 1)]);

  let g_response;
  try {
    await cloakedPage.goto('https://www.reddit.com/register/?dest=https%3A%2F%2Fwww.reddit.com%2F');
  } catch (e) {
    console.log(e);
    await cloakedPage.close();
    await browser.close();
    return;
  }

  g_response = solveRec();
  await cloakedPage.reload({waitUntil: ["networkidle0", "domcontentloaded"]});

  function getUniqueName(randomName) {
    let n = randomName;
    n = n.split('').map((s) => {
      if (Math.random() <= 0.07)
        return s.toUpperCase();
      return s;
    });
    for (let i = 1; i < randomName.length; i++) {
      if (Math.random() <= 0.07)
        n.splice(i, 0, String(getRandomInt(0, 9)));
      if (Math.random() <= 0.04)
        n.splice(i, 0, '_');
      if (Math.random() <= 0.02)
        n.splice(i, 0, '-');
    }
    return n.join('');
  }

  const randomName = getUniqueName(UsernameGenerator.generateUsername()).slice(0, 18);

  const password = generatePassword();
  await cloakedPage.type('#regEmail', `${generatePassword()}@${generatePassword()}.com`, {delay: getRandomInt(200, 400)});
  await cloakedPage.click('.AnimatedForm__submitButton');

  await sleep(getRandomInt(4000, 10000));
  await cloakedPage.type('#regUsername', randomName, {delay: getRandomInt(200, 400)});
  await cloakedPage.type('#regPassword', password, {delay: getRandomInt(200, 400)});
  try {
    await cloakedPage.waitForSelector("#g-recaptcha");
    await cloakedPage.setDefaultTimeout(80000);
    await cloakedPage.waitForSelector("#g-recaptcha-response");
    if (await cloakedPage.$('#g-recaptcha-response') !== null) {
      await cloakedPage.evaluate(() => {
        document.querySelector('#g-recaptcha-response').style.display = 'block';
      });
      await g_response.then((data) => cloakedPage.type('#g-recaptcha-response', data.split('|')[1]));
    }
  } catch (error) {
    console.log("Капчи нет или ошибка: " + error);
    await browser.close();
    return;
  }
  await sleep(getRandomInt(2000, 4000));
  await cloakedPage.click('.SignupButton');
  await sleep(getRandomInt(5000, 15000));
  try {
    await cloakedPage.waitForSelector('.SubscribeButton');
    await cloakedPage.click('.SubscribeButton');
    await sleep(getRandomInt(10000, 20000));
    let date = new Date();
    //await cloakedPage.goto('https://ident.me');
    //let ip = await cloakedPage.$eval('*', el => el.innerText);
    fs.appendFileSync(`accs/data/${date.getMonth() + 1}.${date.getDate()}-${(proxy.split('@')[0]).split(':')[2]}.txt`, `\n${randomName}:${password}|${date.getMonth() + 1}.${date.getDate()}|${(proxy.split('@')[0]).split(':')[2]}`);
    console.log(`OK!`);
    await warmup('',browser,cloakedPage);
  } catch (e) {
    console.log('FAIL! ' + e);
    await browser.close();
    return;
  }
  await cloakedPage.close();
  await browser.close();
}


async function start(i) {
  await sleep(getRandomInt(2*60*1000, 7*60*1000));
  while (true) {
    try {
      await reg(proxyList[i]);
    } catch (e) {
      console.log(e);
    }
    await sleep(getRandomInt(2*60 * 60 * 1000, 2.4 *60* 60 * 1000));
  }
}

async function first() {
  for (let i = 0; i < 14; i++) {
    start(i);
  }
}

first();
