# Wickly
Stock tracker website which allows for commenting and grouping of stocks as "index funds". 
## Setup
The server requires a **.env** file located in the root directory (same folder as the package.json).
This requires a [polygon.io](https://polygon.io) API key and a defined (provided default) hash key for ID generation.

    PORT = 8080
    POLYGON_API_KEY = "API KEY"
    HASH_KEY = "HASH KEY"

Before starting, you must run 

    npm install
## Running
The server can be ran using 

    npm run start
or optionally (using nodemon),

    npm run dev
Any changes to HTML classes requires the CSS to be recompiled by Tailwind, which can be done by running 

    npm run compilecss
