import { postJSONData, getJSONData } from "./lib/handler.js"

document.createIndexFund = async function(location, stocks) {
  if (!("id" in localStorage && "hashed_id" in localStorage)) {
    console.error("No IDs generated, cannot send message.")
    return Promise.reject(400);
  };

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

