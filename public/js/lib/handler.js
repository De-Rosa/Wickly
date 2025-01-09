async function wrapper(fetch) {
  try {
    if (!location) throw new Error('Missing location')

    let fetched = await fetch()
    if (fetched.ok) return fetched;
    throw new Error(`Response ${fetched.status}`)

  } catch (error) {
    return Promise.reject(error)
  }
}

async function getJSONData(location) {
  let data = await wrapper(async () => {
    return fetch(`/${location}`, {
      method: "GET",
      headers: {"Content-Type": "application/json"}
    })
  })

  return data.json()
}

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
