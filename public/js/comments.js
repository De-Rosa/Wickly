document.sendComment = function(location, comment) {
  if (!("id" in localStorage && "hashed_id" in localStorage)) {
    console.error("No IDs generated, cannot send message.")
    return;
  };

  let data = {
    "location": location, 
    "contents": comment, 
    "id": localStorage.getItem("id"),
    "hashed_id": localStorage.getItem("hashed_id")
  }

  postCommentData(data)
}

document.getComments = function(location) {
  getCommentData(location)
}

function postCommentData(data) {
  let json;
  try {
    json = JSON.stringify(data)
  } catch(e) {
    console.error("Could not post comment data, error in converting to JSON.")
    return;
  }

  var xhttp = new XMLHttpRequest();
  xhttp.open('POST', '/comments/', true)
  xhttp.setRequestHeader('Content-type' , 'application/json')

  xhttp.onload = function () {
    if (this.status == 200) {
      console.log("Successful in sending message!");
      return;
    }
    console.error(`Error from server when posting comment, status ${this.status}.`)
  }
  xhttp.onerror = function () {
    console.error("Error when posting comment data.")
  }

  xhttp.send(json)
}

function getCommentData(location) {
  var xhttp = new XMLHttpRequest();

  xhttp.open('GET', `/comments/?location=${location}`, true);

  xhttp.onload = function () {
    // If not successful (status code 200), return.
    if (this.status !== 200) {
      console.error("Unsuccessful in getting comment data.")
    }
    console.log(this.responseText)
  }
  xhttp.onerror = function () {
    console.error(`Error in requesting comment data.`)
  }
  xhttp.send();
}
