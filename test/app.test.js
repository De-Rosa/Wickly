// Jest test file.
// Based on https://github.com/stevenaeola/progblack_2425/blob/main/spinder/app.test.js

const fs = require('fs')
const request = require('supertest')
const app = require('../src/server/app')

// Resets the JSON databases to empty JSON files (so that we can control conflicts).
function resetDatabases() {
  try {
    console.log("Resetting databases...")
    fs.writeFileSync(__dirname + "/../src/server/databases/comments.json", "{}");
    fs.writeFileSync(__dirname + "/../src/server/databases/index-funds.json", "{}");
  } catch (error) {
    console.error(`Failure to reset databases back to default, error: ${error.message}`);
  }
}

resetDatabases()

describe('Testing ID endpoint', () => {
  test('GET request: /ids', () => {
    return request(app)
      .get('/ids')
      .expect(200)
  })
})

describe('Testing comments endpoints', () => {
  test('POST request with valid key, valid IDs, valid data: /comments', () => {
    const params = {
      "key": "AAPL", 
      "contents": "New APPL comment!", 
      "id": "45afcb78-0a44-4100-afc5-04335e225235", 
      "hashed_id": "37b1dbd999e0c78ccf91b8170594e0edbb7490246d2d7ed689e7859a3c54e7f4" 
    }
    return request(app)
      .post('/comments')
      .send(params)
      .expect(200)
  })

  test('POST request with missing key, valid IDs, valid data: /comments', () => {
    const params = {
      "key": "", 
      "contents": "New APPL comment!", 
      "id": "45afcb78-0a44-4100-afc5-04335e225235", 
      "hashed_id": "37b1dbd999e0c78ccf91b8170594e0edbb7490246d2d7ed689e7859a3c54e7f4" 
    }
    return request(app)
      .post('/comments')
      .send(params)
      .expect(400)
  })

  test('POST request with invalid key (formatted not according to [A-Z.]*), valid IDs, valid data: /comments', () => {
    const params = {
      "key": "test2", 
      "contents": "New test2 comment!", 
      "id": "45afcb78-0a44-4100-afc5-04335e225235", 
      "hashed_id": "37b1dbd999e0c78ccf91b8170594e0edbb7490246d2d7ed689e7859a3c54e7f4" 
    }
    return request(app)
      .post('/comments')
      .send(params)
      .expect(400)
  })

  test('POST request with valid key, invalid IDs, valid data: /comments', () => {
    const params = {
      "key": "AAPL", 
      "contents": "New APPL comment!", 
      "id": "45afcb78-0a44-4100-afc5-04335e225235", 
      "hashed_id": "tampered" 
    }
    return request(app)
      .post('/comments')
      .send(params)
      .expect(401)
  })

  test('POST request with valid key, valid IDs, invalid data (length 0): /comments', () => {
    const params = {
      "key": "AAPL", 
      "contents": "", 
      "id": "45afcb78-0a44-4100-afc5-04335e225235", 
      "hashed_id": "37b1dbd999e0c78ccf91b8170594e0edbb7490246d2d7ed689e7859a3c54e7f4" 
    }
    return request(app)
      .post('/comments')
      .send(params)
      .expect(400)
  })

  test('GET request with valid key: /comments?key=AAPL', () => {
    return request(app)
      .get('/comments?key=AAPL')
      .expect(200)
  })

  test('GET request with valid key (but empty data): /comments?key=NONEXIST', () => {
    return request(app)
      .get('/comments?key=NONEXIST')
      .expect(200)
  })

  test('GET request with no key: /comments?key=', () => {
    return request(app)
      .get('/comments?key=')
      .expect(400)
  })

  test('GET request with invalid key (formatted not according to [A-Z.]*): /comments?key=test2', () => {
    return request(app)
      .get('/comments?key=test2')
      .expect(400)
  })
});

describe('Testing index funds endpoints', () => {
  test('POST request with valid key, valid IDs, valid data: /index-funds', () => {
    const params = {
      "key": "INDEX", 
      "stocks": ["AAPL"], 
      "id": "45afcb78-0a44-4100-afc5-04335e225235", 
      "hashed_id": "37b1dbd999e0c78ccf91b8170594e0edbb7490246d2d7ed689e7859a3c54e7f4" 
    }

    return request(app)
      .post('/index-funds')
      .send(params)
      .expect(200)
  })

  test('POST request with missing key, valid IDs, valid data: /index-funds', () => {
    const params = {
      "key": "", 
      "stocks": ["AAPL"], 
      "id": "45afcb78-0a44-4100-afc5-04335e225235", 
      "hashed_id": "37b1dbd999e0c78ccf91b8170594e0edbb7490246d2d7ed689e7859a3c54e7f4" 
    }

    return request(app)
      .post('/index-funds')
      .send(params)
      .expect(400)
  })

  test('POST request with invalid key (formatted not according to [A-Z]*), valid IDs, valid data: /index-funds', () => {
    const params = {
      "key": "test2", 
      "stocks": ["AAPL"], 
      "id": "45afcb78-0a44-4100-afc5-04335e225235", 
      "hashed_id": "37b1dbd999e0c78ccf91b8170594e0edbb7490246d2d7ed689e7859a3c54e7f4" 
    }

    return request(app)
      .post('/index-funds')
      .send(params)
      .expect(400)
  })

  test('POST request with valid key, invalid IDs, valid data: /index-funds', () => {
    const params = {
      "key": "INDEXII", 
      "stocks": ["AAPL"], 
      "id": "45afcb78-0a44-4100-afc5-04335e225235", 
      "hashed_id": "tampered" 
    }

    return request(app)
      .post('/index-funds')
      .send(params)
      .expect(401)
  })

  test('POST request with valid key, valid IDs, invalid data (length 0): /index-funds', () => {
    const params = {
      "key": "INDEXIII", 
      "stocks": [], 
      "id": "45afcb78-0a44-4100-afc5-04335e225235", 
      "hashed_id": "37b1dbd999e0c78ccf91b8170594e0edbb7490246d2d7ed689e7859a3c54e7f4" 
    }

    return request(app)
      .post('/index-funds')
      .send(params)
      .expect(400)
  })

  test('POST request with valid key, valid IDs, invalid data (length > 10): /index-funds', () => {
    const params = {
      "key": "INDEXIII", 
      "stocks": ["AAPL", "MSFT", "OTHER", "OTHERII", "OTHERIII", "OTHERIV", "OTHERV", "OTHERVI", "OTHERVII", "OTHERVIII", "OTHERIX"], 
      "id": "45afcb78-0a44-4100-afc5-04335e225235", 
      "hashed_id": "37b1dbd999e0c78ccf91b8170594e0edbb7490246d2d7ed689e7859a3c54e7f4" 
    }

    return request(app)
      .post('/index-funds')
      .send(params)
      .expect(400)
  })

  test('POST request with duplicate key, valid IDs, valid data: /index-funds', () => {
    const params = {
      "key": "INDEX", 
      "stocks": ["AAPL", "MSFT"], 
      "id": "45afcb78-0a44-4100-afc5-04335e225235", 
      "hashed_id": "37b1dbd999e0c78ccf91b8170594e0edbb7490246d2d7ed689e7859a3c54e7f4" 
    }

    return request(app)
      .post('/index-funds')
      .send(params)
      .expect(409)
  })

  test('GET request with valid key: /index-funds?key=INDEX', () => {
    return request(app)
      .get('/index-funds?key=INDEX')
      .expect(200)
  })

  test("GET request with valid key (doesn't have data): /index-funds?key=NONEXIST", () => {
    return request(app)
      .get('/index-funds?key=NONEXIST')
      .expect(200)
  })

  test('GET request with no key: /index-funds?key=', () => {
    return request(app)
      .get('/index-funds?key=')
      .expect(400)
  })

  test('GET request with invalid key (formatted not according to [A-Z]*): /index-funds?key=test2', () => {
    return request(app)
      .get('/index-funds?key=test2')
      .expect(400)
  })
});

// TODO: mocking for stocks GETs calls
