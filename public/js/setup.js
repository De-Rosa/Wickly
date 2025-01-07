function getIDs(reset = false) {

  if ("id" in localStorage && "hashed_id" in localStorage && !reset) return;

  var xhttp = new XMLHttpRequest();

  xhttp.open('GET', '/ids/', true);

  xhttp.onload = function () {
    // If not successful (status code 200), return.
    if (this.status !== 200) {
      console.error("Unsuccessful in recieving IDs.")
    }
    const {id, hashed_id} = JSON.parse(this.responseText);
    localStorage.setItem('id', id)
    localStorage.setItem('hashed_id', hashed_id)
  }
  xhttp.onerror = function () {
    console.error(`Error in requesting IDs.`)
  }
  xhttp.send();
}

window.onload = function() {
  getIDs()
}
