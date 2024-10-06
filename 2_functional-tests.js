const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");

chai.use(chaiHttp);
let stockSymbol = "GOOG";
let stockSymbol2 = "MSFT";
let likeResponse;

suite("Functional Tests", function () {
  // Test viewing one stock
  test("Viewing one stock: GET request to /api/stock-prices/", (done) => {
    chai
      .request(server)
      .get("/api/stock-prices")
      .query({ stock: stockSymbol })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.exists(res.body.stockData);
        assert.equal(res.body.stockData.stock, stockSymbol);
        assert.isNumber(res.body.stockData.price);
        assert.isNumber(res.body.stockData.likes);
        done();
      });
  });

  // Test viewing one stock and liking it
  test("Viewing one stock and liking it: GET request to /api/stock-prices/", (done) => {
    chai
      .request(server)
      .get("/api/stock-prices")
      .query({ stock: stockSymbol, like: true })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        likeResponse = res.body.stockData.likes; // Store the likes count
        assert.equal(res.body.stockData.stock, stockSymbol);
        assert.isNumber(res.body.stockData.price);
        assert.equal(res.body.stockData.likes, likeResponse);
        done();
      });
  });

  // Test viewing the same stock and liking it again
  test("Viewing the same stock and liking it again: GET request to /api/stock-prices/", (done) => {
    chai
      .request(server)
      .get("/api/stock-prices")
      .query({ stock: stockSymbol, like: true })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.stockData.stock, stockSymbol);
        assert.isNumber(res.body.stockData.price);
        assert.equal(res.body.stockData.likes, likeResponse + 1); // Check if likes increased
        done();
      });
  });

  // Test viewing two stocks
  test("Viewing two stocks: GET request to /api/stock-prices/", (done) => {
    chai
      .request(server)
      .get("/api/stock-prices")
      .query({ stock: [stockSymbol, stockSymbol2] })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body.stockData);
        assert.equal(res.body.stockData.length, 2);
        assert.equal(res.body.stockData[0].stock, stockSymbol);
        assert.equal(res.body.stockData[1].stock, stockSymbol2);
        assert.isNumber(res.body.stockData[0].price);
        assert.isNumber(res.body.stockData[1].price);
        done();
      });
  });

  // Test viewing two stocks and liking them
  test("Viewing two stocks and liking them: GET request to /api/stock-prices/", (done) => {
    chai
      .request(server)
      .get("/api/stock-prices")
      .query({ stock: [stockSymbol, stockSymbol2], like: true })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body.stockData);
        assert.equal(res.body.stockData.length, 2);
        assert.equal(res.body.stockData[0].stock, stockSymbol);
        assert.equal(res.body.stockData[1].stock, stockSymbol2);
        assert.isNumber(res.body.stockData[0].price);
        assert.isNumber(res.body.stockData[1].price);
        assert.isNumber(res.body.stockData[0].rel_likes);
        assert.isNumber(res.body.stockData[1].rel_likes);
        done();
      });
  });
});
