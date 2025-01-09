import { getJSONData } from "./lib/handler.js"

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

document.getIDs = function() { getIDs(true) }

window.onload = function() {
  getIDs()
}
