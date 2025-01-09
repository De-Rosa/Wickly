import { postJSONData, getJSONData } from "./lib/handler.js"

document.createIndexFund = async function(location, comment) {
  if (!("id" in localStorage && "hashed_id" in localStorage)) {
    console.error("No IDs generated, cannot send message.")
    return;
  };

  let data = {
    "key": location, 
    "stocks": comment, 
    "id": localStorage.getItem("id"),
    "hashed_id": localStorage.getItem("hashed_id")
  }

  return postIndexData(data)
}

document.getIndexFund = async function(key) {
  if (!key) {
    console.error("No key to get index fund data from!")
    return null;
  }
  let indexData = await getIndexData(key);
  return indexData;
}

async function postIndexData(data) {
  let result = await postJSONData("index-funds", data).catch((error) => { 
    console.error(`Error when posting index fund data to server: ${error}.`)
    return false;
  });

  return result;
}

async function getIndexData(key) {
  let commentData = await getJSONData(`index-funds?key=${key}`).catch((error) => { 
    console.error(`Error when getting index fund data from server: ${error}`)
    return null;
  });

  return commentData;
}
