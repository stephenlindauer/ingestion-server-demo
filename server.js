const WebSocket = require("ws");
const http = require("http");
const fs = require("fs");

const HTTP_SERVER_PORT = 3000;
const WS_SERVER_PORT = 3001;

/**
 * Utility methods
 */
const parseUrlParams = (url) => {
  return JSON.parse(
    '{"' +
      decodeURI(url.split("?")[1])
        .replace(/"/g, '\\"')
        .replace(/&/g, '","')
        .replace(/=/g, '":"') +
      '"}'
  );
};

const writeDataToFile = (data, filename) => {
  return new Promise((resolve, reject) => {
    fs.appendFile(filename, data, function (err) {
      console.log(`\twrote ${data.length} bytes to ${filename}`);
      if (err) {
        console.log(`\twrite failed for ${filename}`);
        reject(err);
      }
      resolve();
    });
  });
};

const processBroadcastInput = (broadcastID, data) => {
  return new Promise((resolve, reject) => {
    // write input to file
    console.log(`\twrite ${data.length} bytes`);
    const stream_filename = `uploads/${broadcastID}.webm`;
    fs.appendFile(stream_filename, data, function (err) {
      if (err) {
        console.log(err);
        reject(err);
      }
      resolve();
    });
  });
};

/**
 * DASH Ingestion
 */
const handleDashRequest = (req, res, headers) => {
  if (req.params.filename.indexOf(".mpd") != -1) {
    // ignore manifest for our purpose
    res.writeHead(200, headers);
    res.end("ok");
    return;
  }

  // combine all chunks and write to file <broadcast_id>.webm
  let chunks = [];
  req.on("data", (chunk) => {
    chunks.push(chunk);
  });
  req.on("end", () => {
    const stream_filename = `uploads/${req.params.broadcastID}.webm`;
    writeDataToFile(Buffer.concat(chunks), stream_filename);
    res.writeHead(200, headers);
    res.end("ok");
  });
};

/**
 * Stream+Fetch
 */
let lastPromise = Promise.resolve();
const handleStreamRequest = (req, res, headers) => {
  let lastPromise = Promise.resolve();
  req.on("data", function (chunk) {
    lastPromise = lastPromise.then(() =>
      processBroadcastInput(req.params.broadcastID, chunk)
    );
  });
  res.writeHead(200, headers);
  res.end("Hello World");
};

/**
 * Setup simple http server
 */
console.log("Starting http server on port " + HTTP_SERVER_PORT);
http
  .createServer(function (req, res) {
    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "OPTIONS, POST, GET, PUT",
      "Access-Control-Max-Age": 2592000, // 30 days
      "Access-Control-Allow-Headers":
        "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With",
    };

    console.log(`${req.method} ${req.url}`);

    if (req.method === "OPTIONS") {
      res.writeHead(204, headers);
      res.end();
      return;
    }

    // Add path (minus url params) and params to request obj
    req.path = req.url.split("?")[0];
    req.params = parseUrlParams(req.url);

    // Add request handlers here
    if (req.method == "PUT" && req.path == "/upload") {
      handleDashRequest(req, res, headers);
    } else if (req.method == "PUT" && req.path == "/stream") {
      handleStreamRequest(req, res, headers);
    } else {
      res.writeHead(405, headers);
      res.end(`Request ${req.method} ${req.path} was not handled.`);
      console.log(`Request ${req.method} ${req.path} was not handled.`);
    }
  })
  .listen(HTTP_SERVER_PORT);

/**
 * Setup simple websocket server
 */
console.log("Starting websocket server on port " + WS_SERVER_PORT);
const wss = new WebSocket.Server({ port: WS_SERVER_PORT });
wss.on("connection", function connection(ws) {
  let broadcastID = null;
  ws.on("message", function incoming(message) {
    // First message received must be a JSON object that includes a broadcastID.
    // Once we have RUSH packaging, this would be included in the header, but this is fine for now.
    if (broadcastID == null) {
      const o = JSON.parse(message);
      broadcastID = o.broadcast_id;
      if (broadcastID) {
        console.log("Connection established for " + broadcastID);
      } else {
        console.log("Missing broadcast ID in first message");
      }
      return;
    }

    // Parse the data
    try {
      // const blob = new Blob(message);
      console.log(message);
      const stream_filename = `uploads/${broadcastID}.webm`;
      writeDataToFile(message, stream_filename);
    } catch (e) {
      console.log(e);
    }
  });

  ws.send("something");
});
