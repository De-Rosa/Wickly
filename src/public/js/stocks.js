// Stocks file, contains methods for getting details/chart data for a given stock/crypto. 
import { postJSONData, getJSONData } from "./lib/handler.js"

// GET the details of a given stock/crypto from its key.
// Can return a rejected Promise, so must be error handled. 

document.getStockDetails = async function(key) {
  if (!key) {
    console.error("No ticker for stock!")
    return Promise.reject(400);
  }

  let stockDetails = await getJSONData(`stocks/details?key=${key}`)
  return stockDetails;
}

// GET the aggregate bars of a given stock/crypto from its key. 
// Can return a rejected Promise, so must be error handled. 

document.getStockBars = async function(key) {
  if (!key) {
    console.error("No ticker for stock!")
    return Promise.reject(400);
  }

  let stockBars = await getJSONData(`stocks/aggs?key=${key}`)
  return stockBars;
}

