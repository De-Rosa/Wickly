let current = null;
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

// for index fund view, just do the graph of the averages or something idk

document.openView = function() {
  document.hideSearch()
  document.showView()
}

document.showView = function() {
  let searchScreen = document.getElementById("view-screen");
  if (!searchScreen.classList.contains("hidden")) return;
  searchScreen.classList.remove('hidden')
}

document.hideView = function () {
  let viewScreen = document.getElementById("view-screen");
  if (viewScreen.classList.contains("hidden")) return;
  viewScreen.classList.add('hidden')
}

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
    if (error.message == "401") {
      reauthorize()
      return
    }
    document.commentError(error)
    return;
  }
}


async function displayComments(comments) {
  if (!comments) {
    document.createErrorAlert("Could not display comments.")
    return;
  }

  resetComments()

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

// https://stackoverflow.com/a/33193694
function scrollToBottom() {
  const comments = document.getElementById("scroll")
  comments.scrollTop = comments.scrollHeight;
}

function ownsComment(id) {
  return id == localStorage.getItem("id");
}

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

function emptyCommentsText() {
  document.getElementById("comments").textContent = "There are no comments..."
}

function resetComments() {
  document.getElementById("comments").innerHTML = ""
  document.getElementById("comment-form").reset()
}

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

document.removeCommentError = async function() {
  let commentBox = document.getElementById("comment-box");
  let submit = document.getElementById("comment-submit");
  if (!commentBox.classList.contains("input-error") || !submit.classList.contains("select-error")) return;
  commentBox.classList.remove("input-error")
  submit.classList.remove("select-error")
}

function displayChart(aggs, names) {
  const font = getFont();

  var charts = [];
  

  for (let i = 0; i < aggs.length; i++) {
    let chart = chartData(aggs[i], names[i], aggs.length > 1)
    if (chart == null) {
      document.createErrorAlert(`${names[i]} doesn't exist...`)
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

let indexFundList = []


document.indexButtonPress = function() {
  document.getElementById("index-button").textContent = "Added!"
  addToIndexList()
}

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
    document.createInfoAlert(`Created index fund ${name}!`)
    resetIndexButton()
    resetIndexList()
  } catch (error) {
    if (error.message == "409") {
      indexSubmitError("Name already exists!")
      return
    }
    if (error.message == "401") {
      reauthorize()
      return
    }
    indexSubmitError(error)
  }
}

function reauthorize() {
  document.createErrorAlert("Invalid IDs, reauthorizing...")
  document.getIDs()
}

async function indexSubmitError(text) {
  let submit = document.getElementById("index-submit");
  if (!submit.classList.contains("btn-error")) {
    submit.classList.add("btn-error")
  };

  await document.createErrorAlert(text)
  document.removeIndexSubmitError()
}

document.removeIndexSubmitError = async function() {
  let submit = document.getElementById("index-submit");
  if (!submit.classList.contains("btn-error")) return;
  submit.classList.remove("btn-error")
}

document.showIndexButton = function() {
  resetIndexButton()
  let button = document.getElementById("index-button");
  if (!button.classList.contains("hidden")) return;
  button.classList.remove('hidden')
}

document.hideIndexButton = function () {
  let button = document.getElementById("index-button");
  if (button.classList.contains("hidden")) return;
  button.classList.add('hidden')
}

function resetIndexButton() {
  let button = document.getElementById("index-button")
  button.textContent = indexFundList.includes(current) ? "Added!" : "Add to Index Fund"
  // https://stackoverflow.com/a/2520670
  document.activeElement.blur()
}

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

function removeIndexFromList(index) {
  let indexName = index.textContent 
  index.remove()

  // https://stackoverflow.com/a/3954451
  var index = indexFundList.indexOf(indexName);
  if (index !== -1) {
    indexFundList.splice(index, 1);
  }

  if (indexName == current) {
    resetIndexButton()
    resetIndexList()
  }
}

function resetIndexList() {
  document.getElementById("index-list").innerHTML = ""
  document.getElementById("index-name").value = ""
}

function getFont() {
  const htmlStyles = window.getComputedStyle(document.querySelector("html"))
  return htmlStyles.getPropertyValue("font-family")
}
