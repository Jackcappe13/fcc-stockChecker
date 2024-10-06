"use strict";

const Stock = require("../models").Stock;
const fetch = require("node-fetch");

// Function to fetch stock data
const fetchStockData = async (stock) => {
  const url = `https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stock}/quote`;
  const response = await fetch(url);

  if (!response.ok) throw new Error(`Error fetching stock data for ${stock}`);

  const stockData = await response.json();
  if (!stockData || !stockData.symbol || !stockData.latestPrice) {
    throw new Error(`Incomplete stock data for ${stock}`);
  }

  return stockData;
};

// Increment likes for a stock
const addLike = async (symbol) => {
  const stockRecord = await Stock.findOne({ symbol });
  if (!stockRecord) throw new Error("Stock not found");

  stockRecord.likes += 1;
  await stockRecord.save();
  return stockRecord.likes;
};

// Prepare response for two stocks with rel_likes
const prepareRelLikesResponse = (stock1, stock2) => ({
  stockData: [
    {
      stock: stock1.symbol,
      price: stock1.price,
      rel_likes: stock1.likes - stock2.likes,
    },
    {
      stock: stock2.symbol,
      price: stock2.price,
      rel_likes: stock2.likes - stock1.likes,
    },
  ],
});

module.exports = function (app) {
  app.route("/api/stock-prices").get(async (req, res) => {
    try {
      const { stock, like } = req.query;
      const stocks = Array.isArray(stock) ? stock : [stock];

      if (stocks.length === 0 || stocks.length > 2) {
        return res
          .status(400)
          .json({ error: "Please pass one or two stock symbols." });
      }

      const stockDataArray = await Promise.all(
        stocks.map(async (symbol) => {
          const stockData = await fetchStockData(symbol);
          let stockRecord =
            (await Stock.findOne({ symbol: stockData.symbol })) ||
            new Stock({
              symbol: stockData.symbol,
              price: stockData.latestPrice,
              likes: 0,
            });

          if (like === "true") {
            await addLike(stockData.symbol);
          }

          // Update the stock price and save
          stockRecord.price = stockData.latestPrice;
          await stockRecord.save();

          return {
            symbol: stockRecord.symbol,
            price: stockRecord.price,
            likes: stockRecord.likes,
          };
        })
      );

      // If two stocks are provided, return the response with rel_likes
      const response =
        stocks.length === 2
          ? prepareRelLikesResponse(stockDataArray[0], stockDataArray[1])
          : {
              stockData: {
                stock: stockDataArray[0].symbol,
                price: stockDataArray[0].price,
                likes: stockDataArray[0].likes,
              },
            };

      return res.json(response);
    } catch (err) {
      console.error("Error in /api/stock-prices:", err);
      return res.status(500).json({ error: "An error occurred." });
    }
  });
};
