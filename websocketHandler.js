/**
 * Websocket Handler
 */

const Utils = require("./utils");

const handleWebsocketMessage = (broadcastID, message) => {
  const stream_filename = `uploads/${broadcastID}.webm`;
  Utils.writeDataToFile(message, stream_filename);
};

module.exports = handleWebsocketMessage;
