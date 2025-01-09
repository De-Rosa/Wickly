import { postJSONData, getJSONData } from "./lib/handler.js"

document.sendComment = async function(location, comment) {
  if (!("id" in localStorage && "hashed_id" in localStorage)) {
    console.error("No IDs generated, cannot send message.")
    return;
  };

  let data = {
    "key": location, 
    "contents": comment, 
    "id": localStorage.getItem("id"),
    "hashed_id": localStorage.getItem("hashed_id")
  }

  return postCommentData(data)
}

document.getComments = async function(key) {
  if (!key) {
    console.error("No key to get comment data from!")
    return null;
  }
  let commentData = getCommentData(key);
  return commentData;
}

async function postCommentData(data) {
  let result = await postJSONData("comments", data)
  .catch((error) => { 
    console.error(`Error when posting comment data to server: ${error}.`)
    return false;
  });
  return result;
}

async function getCommentData(key) {
  let commentData = await getJSONData(`comments?key=${key}`)
  .catch((error) => { 
    console.error(`Error when getting comment data from server: ${error}.`)
    return null;
  });
  return commentData;
}
