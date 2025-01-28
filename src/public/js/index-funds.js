// Index funds file, contains methods for getting/posting index funds by a given key.
import { postJSONData, getJSONData } from "./lib/handler.js"

// POST an index fund given a key.
// Can return a rejected Promise, so must be error handled. 

document.createIndexFund = async function(location, stocks) {
  if (!("id" in localStorage && "hashed_id" in localStorage)) {
    console.error("No IDs generated, cannot send message.")
    return Promise.reject(400);
  };

  // Name of index fund is not uppercase characters.
  // https://stackoverflow.com/a/23476587
  if (!/^[A-Z]*$/.test(location)) {
    return Promise.reject(400);
  }

  // Removing duplicates from the list.
  // https://stackoverflow.com/a/9229821
  let unique_stocks = [...new Set(stocks)]
  if (unique_stocks.length != stocks.length) {
    console.error("No duplicate elements!")
    return Promise.reject(400)
  }

  let data = {
    "key": location, 
    "stocks": stocks, 
    "id": localStorage.getItem("id"),
    "hashed_id": localStorage.getItem("hashed_id")
  }

  let result = await postJSONData("index-funds", data)
  return result;
}

// GET a comment from a given key/ticker.
// Can return a rejected Promise, so must be error handled. 

document.getIndexFund = async function(key) {
  if (!key) {
    console.error("No key to get index fund data from!")
    return Promise.reject(400);
  }
  let indexData = await getJSONData(`index-funds?key=${key}`)

  if (indexData.length == 0) {
    return Promise.reject(404);
  } 

  return indexData;
}

