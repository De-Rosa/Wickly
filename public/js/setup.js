// Setup file, contains methods for getting (ID, hashed_ID) tuples from the server for authentication.

import { getJSONData } from "./lib/handler.js"

// Gets new IDs from the server.
// Used for comment/index fund ownership and authenticates POST requests.

async function getIDs(reset = false) {
  if ("id" in localStorage && "hashed_id" in localStorage && !reset) return;

  let ids = await getJSONData(`ids`)
  .catch((error) => { 
    console.error(`Error when getting ids from server: ${error}.`)
    return;
  });

  const { id, hashed_id } = ids;

  if (!id || !hashed_id) {
    console.error("Undefined ID/hashed ID! Cannot continue.")
    return;
  }

  localStorage.setItem('id', id)
  localStorage.setItem('hashed_id', hashed_id)
}

// Resets the current IDs (when authentication fails, e.g. due to tampering).

document.getIDs = function() { getIDs(true) }

// IDs are generated (if doesn't exist in LocalStorage) when the client connects to the website. 

window.onload = function() {
  getIDs()
}
