const router = require('express').Router();
const { response } = require('express');
const { quote } = require('yahoo-finance');
const yahooFinance = require('yahoo-finance');
const { User, Stock } = require('../models');
const withAuth = require('../utils/auth');

router.get('/login', (req, res) => {
  if (req.session.logged_in) {
    res.render('/');
    return;
  }
  res.render('login');
});

router.get('/about', withAuth, (req, res) => {
  res.render('about', {
    logged_in: true,
  });
});

router.get('/', (req, res) => {
  let symbol;
  let symbols = ['AAPL', 'AMZN', 'GOOG', 'SNAP'];
  let stocks = [];
  for (let i = 0; i < symbols.length; i++) {
    callApi(symbols[i], i);
  }
  function callApi(symbol, i) {
    yahooFinance.quote(
      {
        symbol: symbol,
        modules: ['financialData'],
      },
      function (err, quotes) {
        if (quotes) {
          const price = quotes.financialData.currentPrice;
          const recommendationKey = quotes.financialData.recommendationKey;
          const ebitda = quotes.financialData.ebitda;
          stocks.push({ symbol: symbol, price: price, ebitda: ebitda });
          if (i === symbols.length - 1) {
            res.render('homepage', {
              stocks,
              logged_in: req.session.logged_in,
            });
          }
        } else {
          return res.status(404).send('Not found');
        }
      }
    );
  }
});

router.get('/price', withAuth, (req, res) => {
  const symbol = req.query.symbol;
  if (!symbol) {
    return res.status(404).send('Not found');
  }
  yahooFinance.quote(
    {
      symbol: symbol,
      modules: ['financialData'],
    },
    function (err, quotes) {
      if (quotes && quotes.financialData && quotes.financialData.currentPrice) {
        res.send({
          symbol: symbol,
          price: quotes.financialData.currentPrice,
        });
      } else {
        return res.status(404).send('Not found');
      }
    }
  );
});

router.get('/status', withAuth, (req, res) => {
  const symbol = req.query.symbol;
  if (!symbol) {
    return res.status(404).send('Not found');
  }
  yahooFinance.quote(
    {
      symbol: symbol,
      modules: ['financialData'],
    },
    function (err, quotes) {
      if (quotes && quotes.financialData) {
        res.send({
          symbol: symbol,
        });
      } else {
        return res.status(404).send('Not found');
      }
    }
  );
});

const addPriceToStock = async (stock) => {
  const updatedStock = await new Promise((resolve, reject) => {
    yahooFinance.quote(
      {
        symbol: stock.symbol,
        modules: ['financialData'],
      },
      function (err, quotes) {
        if (
          quotes &&
          quotes.financialData &&
          quotes.financialData.currentPrice
        ) {
          stock.price = quotes.financialData.currentPrice;
          stock.total = round(quotes.financialData.currentPrice * stock.shares);
          resolve(stock);
        } else {
          reject('stock not found');
        }
      }
    );
  });
  return await updatedStock;
};

router.get('/dashboard', withAuth, async (req, res) => {
  try {
    const userData = await User.findByPk(req.session.user_id, {
      attributes: { exclude: ['password'] },
      include: [{ model: Stock }],
    });

    const user = userData.get({ plain: true });
    const stocks = await Promise.all(
      user.stocks.map(async (stock) => await addPriceToStock(stock))
    );

    res.render('dashboard', {
      stocks,
      logged_in: true,
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get('/register', (req, res) => {
  if (req.session.logged_in) {
    res.redirect('/');
    return;
  }

  res.render('register');
});

function round(value) {
  return Math.round(value * 100) / 100;
}

module.exports = router;
