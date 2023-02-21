const axios = require("axios");
const dayjs = require("dayjs");

const symbols = process.argv.slice(2);

const start_date = dayjs().subtract(30, "day").format("YYYY-MM-DD");
const dates = Array.from({ length: 30 }, (_, i) =>
  dayjs().subtract(i, "day").format("YYYY-MM-DD")
).reverse();

console.log(["Symbol", "API ID", "Current Price (USD)", ...dates].join(","));

(async () => {
  for (const symbol of symbols) {
    const uppersym = symbol.toUpperCase();
    const { data: searchResults } = await axios.get(
      `https://api.coingecko.com/api/v3/search?query=${uppersym}`
    );
    const coin = searchResults.coins.find((c) => c.symbol === uppersym);
    if (!coin) {
      console.error(`Error: could not find API ID for symbol ${symbol}`);
      continue;
    }
    const {
      data: {
        [coin.id]: { usd: price },
      },
    } = await axios.get(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coin.id}&vs_currencies=usd`
    );
    const {
      data: { prices },
    } = await axios.get(
      `https://api.coingecko.com/api/v3/coins/${coin.id}/market_chart?vs_currency=usd&days=30&interval=daily`
    );
    const history = prices
      .slice(-30)
      .map(([ts, price]) => price)
      .join(",");
    console.log(`${symbol},${coin.id},${price},${history}`);
  }
})();
