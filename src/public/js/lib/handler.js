// Handler file, used by other client-side files to GET/POST JSON data to a given route.

// Wrapper for fetch function to catch any errors and reject a promise with an error code.

async function wrapper(fetch) {
  try {
    if (!location) throw new Error(400)

    let fetched = await fetch()
    if (fetched.ok) return fetched;
    throw new Error(fetched.status)

  } catch (error) {
    return Promise.reject(error)
  }
}

// GET request for a given route 
// Outputs the requested JSON.

async function getJSONData(location) {
  let data = await wrapper(async () => {
    return fetch(`/${location}`, {
      method: "GET",
      headers: {"Content-Type": "application/json"}
    })
  })

  return data.json()
}

// POST request for a given route 
// Outputs the status of posting the JSON.

async function postJSONData(location, data) {
  let result = await wrapper(async () => {
    return fetch(`/${location}`, {
      method: "POST",
      body: JSON.stringify(data),
      headers: {"Content-Type": "application/json"}
    })
  })
  return result.status
}

export { postJSONData, getJSONData }
