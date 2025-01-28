// Search file, contains methods handling the search screen, including displaying error/info alerts.

// Open the search screen, hiding the view screen.
// Reset the search form to default.

document.openSearch = function() {
  document.hideView()
  document.showSearch()
  document.getElementById("search-form").reset()
}

// Unhide the search screen.

document.showSearch = function() {
  let searchScreen = document.getElementById("search-screen");
  if (!searchScreen.classList.contains("hidden")) return;
  searchScreen.classList.remove('hidden')
}

// Hide the search screen.

document.hideSearch = function () {
  let searchScreen = document.getElementById("search-screen");
  if (searchScreen.classList.contains("hidden")) return;
  searchScreen.classList.add('hidden')
}

// Handle when the search form has been submitted.
// https://stackoverflow.com/a/59847253

document.searchSubmit = async function(event, form) {
  event.preventDefault()
  let ticker = form.elements.ticker.value 
  let type = form.elements.type.value
  await document.search(ticker, type)
}

// Handle searching given a ticker/key. 
// On successful search, starts the setup of the default view.

document.search = async function (ticker, selection) {
  if (!["Stock", "Crypto", "Index Fund"].includes(selection)) {
    document.searchError("Invalid selection! Cannot search...")
    return;
  }

  // Search index funds if index fund selection selected.
  if (selection == "Index Fund") {
    searchIndexFunds(ticker)
    return;
  }

  // PolygonIO requires an X: prefix for querying cryptocurrencies.
  const prefixes = {"Stock": "", "Crypto": "X:"}
  const query = `${prefixes[selection]}${ticker}`

  try {
    showLoading()
    let stock = await document.getStockDetails(query)
    let stockBars = await document.getStockBars(query)
    let comments = await document.getComments(query)
    hideLoading()

    document.setupStockView(query, stock.results, stockBars.results, comments)

  } catch(error) {
    hideLoading()
    document.statusCodeToError(error.message, document.searchError)
  }
}

// Handle searching an index fund given a key
// On successful search, starts the setup of the index fund view.

async function searchIndexFunds(query) {
  try {
    showLoading()
    let key = `i:${query}`
    let index = await document.getIndexFund(query)
    let comments = await document.getComments(key)
    let stocks = index.stocks
    hideLoading()

    let stockBarList = await getBarsFromList(stocks)
    document.setupIndexView(key, query, stocks, stockBarList, comments)
  } catch(error) {
    hideLoading()
    document.statusCodeToError(error.message == undefined ? error : error.message, document.searchError)
  }
}

// Gets all the aggregate bars given a list of tickers.
// Used to get the data for each stock in an index fund. 

async function getBarsFromList(tickers) {
  try {
    let bars = []
    for (let i = 0; i < tickers.length; i++) {
      let stockBars = await document.getStockBars(tickers[i])
      bars.push(stockBars.results)
    }
  } catch (error) {
    console.error("Error when getting aggregate bars for index fund.")
    throw new Error(error)
  }
  return bars
}

// Style the search bar on an error, and create an error alert.

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

// Remove the styling on the search bar. 

document.removeSearchError = async function() {
  let searchBox = document.getElementById("search-box");
  let selectBox = document.getElementById("select-box");
  if (!searchBox.classList.contains("input-error") || !selectBox.classList.contains("select-error")) return;
  searchBox.classList.remove("input-error")
  selectBox.classList.remove("select-error")
}

// Creates an error alert in the top left of the screen. 

document.createErrorAlert = async function (textContent) {
  await createAlert('alert-error', textContent)
}

// Creates an info alert in the top left of the screen. 

document.createInfoAlert = async function (textContent) {
  await createAlert('alert-info', textContent)
}

// Creates a success alert in the top left of the screen. 

document.createSuccessAlert = async function (textContent) {
  await createAlert('alert-success', textContent)
}

// Adds an alert to the top left toast div.

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

// Waits a given amount of milliseconds before returning the completed promise. When using await, it acts as a timeout. 
// https://masteringjs.io/tutorials/fundamentals/wait-1-second-then#:~:text=You%20could%20also%20wrap%20the,1%20second')%3B%20%7D%20test()%3B 

function wait(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}

// Shows the loading circle inside the search bar. 

function showLoading() {
  const loading = document.getElementById('loading')
  if(loading.classList.contains('xl:inline')) return;
  document.getElementById("loading").classList.add('xl:inline');
}

// Hides the loading circle inside the search bar. 

function hideLoading() {
  const loading = document.getElementById('loading')
  if(!loading.classList.contains('xl:inline')) return;
  document.getElementById("loading").classList.remove('xl:inline');
}

// Given an error code, get the corresponding message and send it to a given error function.

document.statusCodeToError = function(code, errorFunction) {
  switch (`${code}`) {
    case '404':
      errorFunction("Query doesn't exist...")
      break;
    case '401':
      errorFunction("Failure with IDs. Reauthenticating, try again.")
      document.getIDs()
      break;
    case '409':
      errorFunction("Already exists, try a different name.")
      break;
    case '429':
      errorFunction("Too many requests! Please try again later.")
      break;
    case 'Load failed':
      errorFunction("The server is unresponsive. Please try again later.")
      break;
    default:
      errorFunction(`Error when attempting to search.`)
      console.error(code)
      break;
  }
}
