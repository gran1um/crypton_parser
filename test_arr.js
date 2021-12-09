let token;

let token_info = {
  "The Crypto YouMILK": {
    название: "The Crypto YouMILK",
    символ: "MILK",
    "о токене": "The Best Play-to-Earn Blockchain Game on #BSC. ",
    цена: "$0.105 (1x)",
    "максимальная цена": "$0.2025 (3x)",
    "минимальная цена": "$0.1177",
    капитализация: "- -",
    "количество токенов": "No Data",
    сеть: "Binance Smart Chain (BEP20)",
    контракт: "0xBf37f781473f3b50E82C668352984865eac9853f",
    "twitter link": "https://twitter.com/TheCryptoYou",
    "twitter info": {
      "количество читателей": "20.9K",
      "количество твитов": "66 Tweets",
      "Закрепленная запись": [Object],
    },
  },
  GuildFiGF: {
    название: "GuildFiGF",
    символ: "GF",
    "о токене":
      "The interconnected ecosystem of games, communities, and NFT assets. ",
    цена: "$3.16 (1x)",
    "максимальная цена": "$3.41 (1x)",
    "минимальная цена": "$3.03",
    капитализация: "$124,441,747",
    "количество токенов": "1,000,000,000",
    сеть: "Ethereum",
    контракт: "0xaaef88cea01475125522e117bfe45cf32044e238",
    "twitter link": "https://twitter.com/GuildFiGlobal",
    "twitter info": {
      "количество читателей": "82.8K",
      "количество твитов": "304 Tweets",
      "Закрепленная запись": [Object],
    },
  },
  "Dawn WarsDW": {
    название: "Dawn WarsDW",
    символ: "DW",
    "о токене": "An original Puppy GameFi presented by CoPuppy Team.",
    цена: "$3.40 (1x)",
    "максимальная цена": "$4.41 (2x)",
    "минимальная цена": "$2.49",
    капитализация: "- -",
    "количество токенов": "703,200",
    сеть: "Binance Smart Chain (BEP20)",
    контракт: "0x951ad8020cee44f6cec9b8aff9fc8e42363f6f50",
    "twitter link": "https://twitter.com/DawnWars",
    "twitter info": {
      "количество читателей": "4,435",
      "количество твитов": "60 Tweets",
      "Закрепленная запись": [Object],
    },
  },
};
// let date = new Date();
// console.log(
//   `Crypto Ham$ter от ${date.getDate()}.${
//     date.getMonth() + 1
//   }.${date.getFullYear()} ${date.getHours()}-${date.getMinutes()}.html`
// );

let nominations = {};


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
        token_info[element]["максимальная цена"].split("(")[1].split("x")[0]
      ) - Number(token_info[element]["цена"].split("(")[1].split("x")[0]);
  } catch (error) {
    nice_type_max_current = 0;
  }

  let nice_type_follow = nice_type_func(
    token_info[element]["twitter info"]["количество читателей"]
  );

  let nice_type_cap = nice_type_func(token_info[element]["капитализация"]);

  if (nice_type_follow > max_followers) {
    max_followers = nice_type_follow;
    nominations['max_followers_owner'] = token_info[element]["название"];
  }

  if (nice_type_cap > max_market_cap) {
    max_market_cap = nice_type_cap;
    nominations['max_market_cap_owner'] = token_info[element]["название"];
  }

  if (nice_type_max_min > change_max_min) {
    change_max_min = nice_type_max_min;
    nominations['change_max_min_owner'] = token_info[element]["название"];
  }

  if (nice_type_max_current > change_max_current) {
    change_max_current = nice_type_max_current;
    nominations['change_max_current_owner'] = token_info[element]["название"];
  }
});

function nice_type_func(elem) {
  let nice_type = 0;

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
}

console.log(nominations);
