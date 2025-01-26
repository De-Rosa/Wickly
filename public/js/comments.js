import { postJSONData, getJSONData } from "./lib/handler.js"

document.sendComment = async function(location, comment) {
  if (!("id" in localStorage && "hashed_id" in localStorage)) {
    console.error("No IDs generated, cannot send message.")
    return Promise.reject(400);
  };

  let data = {
    "key": location, 
    "contents": comment, 
    "id": localStorage.getItem("id"),
    "hashed_id": localStorage.getItem("hashed_id")
  }

  let result = await postJSONData("comments", data)
  return result;
}

document.getComments = async function(key) {
  if (!key) {
    console.error("No key to get comment data from!")
    return Promise.reject(400);
  }

  let commentData = await getJSONData(`comments?key=${key}`)
  return commentData;
}

