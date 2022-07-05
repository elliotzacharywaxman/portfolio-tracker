const addSymbolButton = document.getElementById('add-symbol-button');
const reduceSymbolButton = document.getElementById('reduce-symbol-button');
const symbolInput = document.getElementById('symbol-input');
const sharesInput = document.getElementById('shares-input');
const symbolList = document.getElementById('symbol-list');
const symbols = [];

const config = {
  type: 'doughnut',
  data: {
    labels: [],
    datasets: [
      {
        label: 'My Portfolio',
        backgroundColor: [],
        data: [],
      },
    ],
  },
  options: {},
};

const myChart = new Chart(document.getElementById('chart'), config);

reduceSymbolButton.addEventListener('click', () => {
  const symbolInputValue = symbolInput.value.toUpperCase();
  checkSymbolBeforeReduce(symbolInputValue);
});

function checkSymbolBeforeReduce(symbol) {
  fetch('/status?symbol=' + symbol).then((response) => {
    if (response.ok) {
      reduceSymbolToChart();
    } else {
      symbolInput.value = '';
      sharesInput.value = '';
      alert('Stock not found');
      window.location.replace('/dashboard');
    }
  });
}

function reduceSymbolToChart() {
  const symbolInputValue = symbolInput.value.toUpperCase();
  const sharesInputValue = sharesInput.value * -1;
  symbols.value = '';
  for (let i = 0; i < symbolList.children.length; i++) {
    symbols.push(symbolList.children[i].children[0].innerHTML);
  }
  if (symbols.includes(symbolInputValue)) {
    for (let i = 0; i < symbolList.children.length; i++) {
      if (symbolInputValue == symbolList.children[i].children[0].innerHTML) {
        sharesUpdate =
          parseInt(sharesInputValue) +
          parseInt(symbolList.children[i].children[1].innerHTML);
        if (sharesUpdate < 0) {
          alert(
            `You don't have enough shares to sell. \nYou only have ${symbolList.children[i].children[1].innerHTML} shares in your portfolio.`
          );
        } else if (sharesUpdate === 0) {
          deleteSymbol(symbolList.children[i].children[4].innerHTML);
        } else {
          updateSymbol(
            symbolInputValue,
            sharesUpdate,
            symbolList.children[i].children[4].innerHTML
          );
        }
      }
    }
  } else {
    alert("You don't have this stock in your portfolio to sell");
  }
  symbolInput.value = '';
  sharesInput.value = '';
}

addSymbolButton.addEventListener('click', () => {
  const symbolInputValue = symbolInput.value.toUpperCase();
  checkSymbolBeforeAdd(symbolInputValue);
});

function checkSymbolBeforeAdd(symbol) {
  fetch('/status?symbol=' + symbol).then((response) => {
    if (response.ok) {
      addSymbolToChart();
    } else {
      symbolInput.value = '';
      sharesInput.value = '';
      alert('Stock not found');
      window.location.replace('/dashboard');
    }
  });
}

function addSymbolToChart() {
  const symbolInputValue = symbolInput.value.toUpperCase();
  const sharesInputValue = sharesInput.value;
  symbols.value = '';

  for (let i = 0; i < symbolList.children.length; i++) {
    symbols.push(symbolList.children[i].children[0].innerHTML);
  }
  if (symbols.includes(symbolInputValue)) {
    for (let i = 0; i < symbolList.children.length; i++) {
      if (symbolInputValue == symbolList.children[i].children[0].innerHTML) {
        sharesUpdate =
          parseInt(sharesInputValue) +
          parseInt(symbolList.children[i].children[1].innerHTML);
        updateSymbol(
          symbolInputValue,
          sharesUpdate,
          symbolList.children[i].children[4].innerHTML
        );
      }
    }
  } else {
    addSymbol(symbolInputValue, sharesInputValue);
  }
  symbolInput.value = '';
  sharesInput.value = '';
}

const deleteSymbol = async (id) => {
  const response = await fetch(`/api/stocks/${id}`, {
    method: 'DELETE',
  });
  if (response.ok) {
    window.location.replace('/dashboard');
  }
};

const updateSymbol = async (symbol, shares, id) => {
  if (symbol && shares) {
    const response = await fetch(`/api/stocks/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ symbol, shares, id }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    window.location.replace('/dashboard');
  } else {
    alert('Please enter both symbol and shares');
  }
};

const addSymbol = async (symbol, shares) => {
  if (symbol && shares) {
    const response = await fetch(`/api/stocks`, {
      method: 'POST',
      body: JSON.stringify({ symbol, shares }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    window.location.replace('/dashboard');
  } else {
    alert('Please enter both symbol and shares');
  }
};

const init = () => {
  for (let i = 0; i < symbolList.children.length; i++) {
    myChart.data.labels.push(symbolList.children[i].children[0].innerHTML);
    myChart.data.datasets[0].data.push(
      symbolList.children[i].children[3].innerHTML
    );
    myChart.data.datasets[0].backgroundColor.push(getRandomColor());
    myChart.update();
  }
};

function getRandomColor() {
  var letters = '0123456789ABCDEF'.split('');
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function round(value) {
  return Math.round(value * 100) / 100;
}

init();
