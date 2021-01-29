const dashHandler = require("./dashHandler");
const streamHandler = require("./streamHandler");
const websocketHandler = require("./websocketHandler");
const Utils = require("./utils");

const WebSocket = require("ws");
const http = require("http");

const HTTP_SERVER_PORT = 3000;
const WS_SERVER_PORT = 3001;

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

    // Log request
    console.log(`${req.method} ${req.url}`);

    if (req.method === "OPTIONS") {
      res.writeHead(204, headers);
      res.end();
      return;
    }

    // Add path (minus url params) and params to request obj
    req.path = req.url.split("?")[0];
    req.params = req.url.split("?").length > 1 ? Utils.parseUrlParams(req.url) : {};

    // Add request handlers here
    if (req.method == "GET" && req.path == "/") {
      res.writeHead(200, headers);
      res.end("Alive");
    } else if (req.method == "PUT" && req.path == "/upload") {
      dashHandler(req, res, headers);
    } else if (req.method == "PUT" && req.path == "/stream") {
      streamHandler(req, res, headers);
    } else {
      res.writeHead(404, headers);
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
      websocketHandler(broadcastID, message);
    } catch (e) {
      console.log(e);
    }
  });

  ws.send("something");
});
