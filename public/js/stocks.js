import { postJSONData, getJSONData } from "./lib/handler.js"

document.getStockDetails = async function(key) {
  if (!key) {
    console.error("No ticker for stock!")
    return Promise.reject(400);
  }

  let stockDetails = await getJSONData(`stocks/details?key=${key}`)
  return stockDetails;
}

document.getStockBars = async function(key) {
  if (!key) {
    console.error("No ticker for stock!")
    return Promise.reject(400);
  }

  let stockBars = await getJSONData(`stocks/aggs?key=${key}`)
  return stockBars;
}

