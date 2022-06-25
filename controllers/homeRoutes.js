const router = require('express').Router();
const { quote } = require('yahoo-finance');
const yahooFinance = require('yahoo-finance');
const { User, Portfolio } = require('../models');
const withAuth = require('../utils/auth');

// router.get('/', async (req, res) => {
//   res.render('homepage', {
//     logged_in: req.session.logged_in
//   })
// }
// );

router.get('/', async (req, res) => {
  const symbol = 'SNAP';
  yahooFinance.quote(
    {
      symbol: symbol,
      modules: ['financialData'],
    },
    function (err, quotes) {
      if (quotes && quotes.financialData && quotes.financialData.currentPrice) {
        // res.send({
        //   symbol: symbol,
        //   price: quotes.financialData.currentPrice,
        // });
        res.render('homepage', {
          symbol: symbol,
          price: quotes.financialData.currentPrice,
          logged_in: req.session.logged_in,
        });
      } else {
        return res.status(404).send('Not found');
      }
    }
  );
});
// Testing
// router.get('/', async (req, res) => {
//   const stockArr = ["AAPL", "TSLA", "AMZN"]
//   for (let i in stockArr) {
//     console.log('i', i)
//     yahooFinance.quote({
//       symbol: stockArr[i],
//       modules: ['price', 'summaryDetail']       // optional; default modules.
//     }, function (err, quote) {
//       console.log(quote);
//     }
//     );
//   }
//   if (quote && quote.financialData && quote.financialData.currentPrice) {
//     res.send({
//       symbol: symbol,
//       price: quote.financialData.currentPrice,
//     });
//   } else {
//     return res.status(404).send('Not found');
//   });
// TESTING RANDOM 

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

router.get('/dashboard', withAuth, async (req, res) => {
  try {
    const userData = await User.findByPk(req.session.user_id, {
      attributes: { exclude: ['password'] },
      include: [{ model: Portfolio }],
    });

    const user = userData.get({ plain: true });

    res.render('dashboard', {
      ...user,
      logged_in: true,
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get('/login', (req, res) => {
  if (req.session.logged_in) {
    res.redirect('/');
    return;
  }

  res.render('login');
});

router.get('/register', (req, res) => {
  if (req.session.logged_in) {
    res.redirect('/');
    return;
  }

  res.render('register');
});
module.exports = router;
