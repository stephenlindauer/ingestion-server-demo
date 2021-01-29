/**
 * Stream+Fetch Handler
 */

const Utils = require("./utils");

const handleStreamRequest = (req, res, headers) => {
  // write each chunk to file <broadcast_id>.webm, waiting on the previous promise to preserve order
  let lastPromise = Promise.resolve();
  req.on("data", function (chunk) {
    lastPromise = lastPromise.then(() =>
      Utils.writeDataToFile(chunk, `uploads/${req.params.broadcastID}.webm`)
    );
  });
  res.writeHead(200, headers);
};

module.exports = handleStreamRequest;
