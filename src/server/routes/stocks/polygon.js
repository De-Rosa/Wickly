// Polygon file, seperated from stocks.js so that jest can mock this file.
// Used for fetching data from polygon.io.

// Function which handles fetching data from PolygonIO.
// Instead of throwing an error, it instead sends an error code (and rejects the promise).
const handling = require("../handling.js")
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function fetchPolygon(res, endpoint) {
  const baseURL = "https://api.polygon.io"
  try {
    fetched = await fetch(`${baseURL}/${endpoint}`, {
      method: "GET",
      headers: {"Content-Type": "application/json"}
    })

    if (fetched.ok) return fetched.json();
    if (fetched.status == "401") {
      console.error("Unauthenticated with Polygon.io, check your API key?")
      return handling.badGateway(res);
    }

    res.sendStatus(fetched.status)
    throw new Error(fetched.status)

  } catch (error) {
    return Promise.reject(error)
  }     
}

module.exports = fetchPolygon;
