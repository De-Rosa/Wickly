// https://stackoverflow.com/a/59847253
document.searchSubmit = async function(event, form) {
  event.preventDefault()
  let ticker = form.elements.ticker.value 
  let type = form.elements.type.value
  await document.search(ticker, type)
}

document.openSearch = function() {
  document.hideView()
  document.showSearch()
  document.getElementById("search-form").reset()
}

document.showSearch = function() {
  let searchScreen = document.getElementById("search-screen");
  if (!searchScreen.classList.contains("hidden")) return;
  searchScreen.classList.remove('hidden')
}

document.hideSearch = function () {
  let searchScreen = document.getElementById("search-screen");
  if (searchScreen.classList.contains("hidden")) return;
  searchScreen.classList.add('hidden')
}

document.search = async function (ticker, selection) {
  if (!["Stock", "Crypto", "Index Fund"].includes(selection)) {
    document.searchError("Invalid selection! Cannot search...")
    return;
  }

  if (selection == "Index Fund") {
    searchIndexFunds(ticker)
    return;
  }

  const prefixes = {"Stock": "", "Crypto": "X:"}
  const query = `${prefixes[selection]}${ticker}`

  try {
    let stock = await document.getStockDetails(query)
    let stockBars = await document.getStockBars(query)
    let comments = await document.getComments(query)

    document.setupStockView(query, stock.results, stockBars.results, comments)

  } catch(error) {
    statusCodeToError(error.message)
  }
}

async function searchIndexFunds(query) {
  try {
    let key = `i:${query}`
    let index = await document.getIndexFund(query)
    let comments = await document.getComments(key)
    let stocks = index.stocks

    let stockBarList = await getBarsFromList(stocks)
    document.setupIndexView(key, query, stocks, stockBarList, comments)
  } catch(error) {
    statusCodeToError(error.message == undefined ? error : error.message)
  }
}

async function getBarsFromList(tickers) {
  let bars = []
  for (let i = 0; i < tickers.length; i++) {
    let stockBars = await document.getStockBars(tickers[i])
    bars.push(stockBars.results)
  }
  return bars
}

document.searchError = async function(text) {
  let searchBox = document.getElementById("search-box");
  let selectBox = document.getElementById("select-box");
  if (!searchBox.classList.contains("input-error") && !selectBox.classList.contains("select-error")) {
    searchBox.classList.add("input-error")
    selectBox.classList.add("select-error")
  };

  await document.createErrorAlert(text)
  document.removeSearchError()
}

document.removeSearchError = async function() {
  let searchBox = document.getElementById("search-box");
  let selectBox = document.getElementById("select-box");
  if (!searchBox.classList.contains("input-error") || !selectBox.classList.contains("select-error")) return;
  searchBox.classList.remove("input-error")
  selectBox.classList.remove("select-error")
}

document.createErrorAlert = async function (textContent) {
  await createAlert('alert-error', textContent)
}
document.createInfoAlert = async function (textContent) {
  await createAlert('alert-info', textContent)
}

async function createAlert(type, textContent) {
  let toast = document.getElementById("toast")
  let alert = document.createElement("div")
  let alertSpan = document.createElement("span")

  alertSpan.textContent = textContent
  alert.classList.add('alert', type, 'max-w-xs', 'lg:max-w-xl', 'overflow-scroll')

  alert.appendChild(alertSpan)
  toast.appendChild(alert)

  await wait(5000)
  alert.remove()
}

// https://masteringjs.io/tutorials/fundamentals/wait-1-second-then#:~:text=You%20could%20also%20wrap%20the,1%20second')%3B%20%7D%20test()%3B
function wait(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}

function statusCodeToError(code) {
  switch (`${code}`) {
    case '404':
      document.searchError("Query doesn't exist...")
      break;
    case '401':
      document.searchError("Error when authenticating...")
      break;
    case '429':
      document.searchError("Too many requests! Please try again later.")
      break;
    case 'Load failed':
      document.searchError("The server is unresponsive. Please try again later.")
      break;
    default:
      document.searchError(`Error when attempting to search.`)
      console.error(code)
      break;
  }
}
