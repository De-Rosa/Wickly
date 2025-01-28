// View file, contains methods handling the viewing screen, including graphing and index fund/comments handling.

// Represents the current ticker being looked at.
// Used for submitting/recieving comments.
let current = null;

// List of selected stocks/crypto to be added to an index fund.
let indexFundList = []

// Set up the crypto/stock view. 

document.setupStockView = async function(key, details, aggs, comments) {
  try {
    current = key
    document.openView()
    document.displayDetails(details)
    document.showIndexButton()

    displayChart([aggs], [key])
    displayComments(comments)
    // https://stackoverflow.com/a/1145012
    window.scrollTo(0, 0); 
  } catch (error) {
    console.error(error)
    document.createErrorAlert("Couldn't create default view...")
    document.openSearch()
  }
}

// Set up the index fund view (don't show index button and change details).

document.setupIndexView = async function(key, name, nameList, aggsList, comments) {
  try {
    current = key
    document.openView()
    document.displayIndexDetails({"name": name, "tickers": nameList})
    document.hideIndexButton()

    displayChart(aggsList, nameList)
    displayComments(comments)
    // https://stackoverflow.com/a/1145012
    window.scrollTo(0, 0); 
  } catch (error) {
    console.error(error)
    document.createErrorAlert("Couldn't create index fund view...")
    document.openSearch()
  }
}

// Open the view screen (hiding search screen).

document.openView = function() {
  document.hideSearch()
  document.showView()
}

// Unhide the view screen div.

document.showView = function() {
  let searchScreen = document.getElementById("view-screen");
  if (!searchScreen.classList.contains("hidden")) return;
  searchScreen.classList.remove('hidden')
}

// Hide the view screen div.

document.hideView = function () {
  let viewScreen = document.getElementById("view-screen");
  if (viewScreen.classList.contains("hidden")) return;
  viewScreen.classList.add('hidden')
}

// Edit the text contents of the details div given the JSON details object.
// Used for stocks/crypto.

document.displayDetails = function(details) {
  const required = ["ticker", "name", "market"]
  required.forEach((property) => {
    if (!details.hasOwnProperty(property)) throw new Error(`Details does not contain property ${property} !`)
  }) 

  document.getElementById("ticker").textContent = details.ticker
  document.getElementById("name").textContent = details.name

  if (details.market == "crypto") {
    document.getElementById("primary-exchange").textContent = details.currency_symbol
    document.getElementById("primary-exchange-title").textContent = "Currency Symbol"
    document.getElementById("type").textContent = details.base_currency_symbol 
    document.getElementById("type-title").textContent = "Base Currency"
    return;
  } 

  document.getElementById("primary-exchange").textContent = details.primary_exchange
  document.getElementById("primary-exchange-title").textContent = "Primary Exchange"
  document.getElementById("type").textContent = details.type
  document.getElementById("type-title").textContent = "Type"
}

// Edit the text contents of the details div given the JSON details object.
// Used for index funds.

document.displayIndexDetails = function(details) {
  const required = ["name", "tickers"]
  required.forEach((property) => {
    if (!details.hasOwnProperty(property)) throw new Error(`Details does not contain property ${property} !`)
  }) 

  document.getElementById("ticker").textContent = details.name
  document.getElementById("name").textContent = "Index Fund"
  document.getElementById("primary-exchange").textContent = details.tickers.length
  document.getElementById("primary-exchange-title").textContent = "Stock Count"
  document.getElementById("type").textContent = "Stocks"
  document.getElementById("type-title").textContent = details.tickers.join(", ")
}

// Comment submit, ran when the form is submitted.
// Performs validation and then POSTs the comment. 

document.commentSubmit = async function(event, form) {
  event.preventDefault()
  if (current == null) {
    document.commentError("Trying to post a comment to nothing!")
    return;
  }

  let text = form.elements.comment.value 
  if (text.length > 100) {
    document.commentError("Comment too long! 100 characters maximum.")
    return;
  }

  if (text.length == 0) {
    document.commentError("Comment cannot be empty...")
    return;
  }
 
  try {
    let result = await document.sendComment(current, text)
    if (!result) throw new Error("Unsuccessful posting of comment...")
    let newComments = await document.getComments(current)
    displayComments(newComments)

  } catch(error) {
    document.statusCodeToError(error.message, document.commentError) 
    return;
  }
}

// Display the comments by creating the comment bubbles.
// An indexed name is given to differing IDs (do not carry across different stock views).

async function displayComments(comments) {
  if (!comments) {
    document.createErrorAlert("Could not display comments.")
    return;
  }

  resetComments()

  // Show the text "No comments to display!" when no comments are available to show.
  if (comments.length == 0) {
    let noComments = document.createElement("div")
    noComments.textContent = "No comments to display!"
    noComments.classList.add('italic', 'text-xl', 'text-center', 'justify-center')
    document.getElementById("comments").appendChild(noComments)
  }

  let names = []
  for (let i = 0; i < comments.length; i++) {
    let comment = comments[i]
    if (!comment.hasOwnProperty("contents") || !comment.hasOwnProperty("id") || !comment.hasOwnProperty("datetime")) {
      throw new Error("Cannot display comments - comment of invalid form.")
    }

    if (!names.includes(comment.id)) {
      names.push(comment.id)
    }

    let name = `User ${names.indexOf(comment.id)} `

    createCommentBubble(comment.contents, ownsComment(comment.id), name, comment.datetime)
  }
  scrollToBottom()
}

// Scroll to the bottom of the screen, used for keeping the comment box scrolled to the newest message.
// https://stackoverflow.com/a/33193694

function scrollToBottom() {
  const comments = document.getElementById("scroll")
  comments.scrollTop = comments.scrollHeight;
}

// Check if the user owns the comment, in which a different style can be displayed. 

function ownsComment(id) {
  return id == localStorage.getItem("id");
}

// Set the comments div to contain placeholder text when no comments are available to show. 

function emptyCommentsText() {
  document.getElementById("comments").textContent = "There are no comments..."
}

// Reset the comment box. 

function resetComments() {
  document.getElementById("comments").innerHTML = ""
  document.getElementById("comment-form").reset()
}

// Create a comment bubble div. 

function createCommentBubble(text, isSelf, name, datetime) {
  let chat = document.createElement("div")
  let bubble = document.createElement("div")
  let header = document.createElement("div")
  let timestamp = document.createElement("time")

  chat.classList.add('chat', `${isSelf ? 'chat-end' : 'chat-start'}`)
  bubble.classList.add('chat-bubble', `${isSelf ? 'chat-bubble-secondary' : 'chat-bubble-primary'}`)
  bubble.textContent = text 

  header.classList.add('chat-header')
  header.textContent = name

  timestamp.classList.add('text-xs', 'opacity-50')
  timestamp.textContent = datetime

  header.appendChild(timestamp)

  chat.appendChild(bubble)
  chat.appendChild(header)
  document.getElementById("comments").appendChild(chat)
}

// Error when submitting comment, style the comment box and create an error alert. 

document.commentError = async function(text) {
  let commentBox = document.getElementById("comment-box");
  let submit = document.getElementById("comment-submit");
  if (!commentBox.classList.contains("input-error") || !submit.classList.contains("select-error")) {
    commentBox.classList.add("input-error")
    submit.classList.add("select-error")
  };

  await document.createErrorAlert(text)
  document.removeCommentError()
}

// Remove the styling on the comment box. 

document.removeCommentError = async function() {
  let commentBox = document.getElementById("comment-box");
  let submit = document.getElementById("comment-submit");
  if (!commentBox.classList.contains("input-error") || !submit.classList.contains("select-error")) return;
  commentBox.classList.remove("input-error")
  submit.classList.remove("select-error")
}

// Change the text of the add button when pressed, and add to the index fund list.

document.indexButtonPress = function() {
  document.getElementById("index-button").textContent = "Added!"
  addToIndexList()
}

// When the index fund is submitted, this function is ran. 
// Sends a POST request for a new index fund to the server after validation. 

document.indexSubmitPress = async function() {
  let name = document.getElementById("index-name").value 
  if (name.length == 0 || name.length > 10) {
    indexSubmitError("Name of invalid length!")
    return;
  }
  if (indexFundList.length == 0) {
    indexSubmitError("Cannot create an empty index fund.")
    return;
  }

  // Name of index fund is not uppercase characters.
  // https://stackoverflow.com/a/23476587
  if (!/^[A-Z]*$/.test(name)) {
    indexSubmitError("Name must be characters only.")
    return;
  }

  if (indexFundList.length > 10) {
    indexSubmitError("Too many elements! (max 10)")
    return;
  }

  try {
    let result = await document.createIndexFund(name, indexFundList)
    if (!result) throw new Error("Issue when creating index fund...")
    indexFundList = []
    document.createSuccessAlert(`Created index fund ${name}!`)
    resetIndexButton()
    resetIndexList()
  } catch (error) {
    document.statusCodeToError(error.message, indexSubmitError) 
  }
}

// Styles the index fund submit button for an error and sends an error alert. 

async function indexSubmitError(text) {
  let submit = document.getElementById("index-submit");
  if (!submit.classList.contains("btn-error")) {
    submit.classList.add("btn-error")
  };

  await document.createErrorAlert(text)
  document.removeIndexSubmitError()
}

// Removes the styling on the submit button. 

document.removeIndexSubmitError = async function() {
  let submit = document.getElementById("index-submit");
  if (!submit.classList.contains("btn-error")) return;
  submit.classList.remove("btn-error")
}

// The index button is shown on stock/crypto views. 

document.showIndexButton = function() {
  resetIndexButton()
  let button = document.getElementById("index-button");
  if (!button.classList.contains("hidden")) return;
  button.classList.remove('hidden')
}

// The index button is hidden on index funds (you cannot add an index fund to an index fund). 

document.hideIndexButton = function () {
  let button = document.getElementById("index-button");
  if (button.classList.contains("hidden")) return;
  button.classList.add('hidden')
}

// Resets the styling on the index button. 

function resetIndexButton() {
  let button = document.getElementById("index-button")
  button.textContent = indexFundList.includes(current) ? "Added!" : "Add to Index Fund"
  // Defocuses the add index button such that the dropdown closes.
  // https://stackoverflow.com/a/2520670
  document.activeElement.blur()
}

// Adds the current stock/crypto to the index fund list. 
// Updates the list div with the new stock/crypto.

function addToIndexList() {
  if (indexFundList.includes(current)) return;
  indexFundList.push(current)

  let newDiv = document.createElement("div")
  let indexList = document.getElementById("index-list")
  newDiv.textContent = current
  newDiv.classList.add('text-lg', 'text-center', 'p-3', 'cursor-pointer', 'hover:text-red-500')

  newDiv.onclick = function() { removeIndexFromList(newDiv) }

  indexList.appendChild(newDiv)
}

// Removes the chosen stock/crypto from the index fund list.
// Updates the styling on the index button if its in the current view. 

function removeIndexFromList(index) {
  let indexName = index.textContent 
  index.remove()

  // https://stackoverflow.com/a/20827100
  indexFundList = indexFundList.filter(function(e) { return e !== indexName })

  if (indexName == current) {
    resetIndexButton()
    if (indexFundList.length == 0) resetIndexList();
  }
}

// Resets the index fund list div.

function resetIndexList() {
  document.getElementById("index-list").innerHTML = ""
  document.getElementById("index-name").value = ""
}

// Display the CanvasJS chart. 
// Aggs is an array which is passed in (for index funds). 

function displayChart(aggs, names) {
  const font = getFont();

  var charts = [];
  
  // Get the objects for each chart being displayed.
  // Legend is showed if the amount of stocks/crypto is greater than 1.
  for (let i = 0; i < aggs.length; i++) {
    let chart = chartData(aggs[i], names[i], aggs.length > 1)
    if (chart == null) {
      document.createErrorAlert(`${names[i]} doesn't exist and/or doesn't have a graph...`)
      continue;
    };
    charts.push(chart)
  }
  
  var stockChart = new CanvasJS.StockChart("chart-container",{
    exportEnabled: false,
    zoomEnabled: true, 
    theme: "dark1",
    backgroundColor: "transparent",
    charts: [{
      axisX: {
        labelFontFamily: font,
        margin: 25,
        crosshair: {
          labelFontFamily: font,
          color: "white",
          enabled: true,
          snapToDataPoint: true
        }
      },
      animationEnabled: true,
      axisY: {
        labelFontFamily: font,
        labelFontWeight: "bold",
        prefix: "$"
      },
      data: charts
    }],
    rangeSelector: {
      enabled: false,
    }
  });
  stockChart.render();
}

// Gets the current font in the theme, so that it can be applied to the chart's text. 

function getFont() {
  const htmlStyles = window.getComputedStyle(document.querySelector("html"))
  return htmlStyles.getPropertyValue("font-family")
}

// Creates the chart for each stock/crypto and pushes the datapoints from the API JSON into a correctly formatted array.

function chartData(data, name, showLegend) {
  let dps = []
  let dataSettings = {
        name: name,
        showInLegend: showLegend,
        type: "candlestick",
        yValueFormatString: "$#,###.##",
        risingColor: "green",
        fallingColor: "red",
        dataPoints : dps
      }

  if (data == undefined) return null;

  // https://www.geeksforgeeks.org/how-to-convert-unix-timestamp-to-time-in-javascript/
  for(let i = 0; i < data.length; i++){
    dps.push({x: new Date(data[i].t), y: [Number(data[i].o), Number(data[i].h), Number(data[i].l), Number(data[i].c)]})
  }

  return dataSettings
}
