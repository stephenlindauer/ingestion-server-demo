/**
 * DASH Ingestion
 */

const Utils = require("./utils");

const handleDashRequest = (req, res, headers) => {
  if (req.params.filename.indexOf(".mpd") != -1) {
    // ignore manifest for our purpose
    res.writeHead(200, headers);
    res.end("ok");
    return;
  }

  // combine all chunks and write to file <broadcast_id>.webm on 'end'
  let chunks = [];
  req.on("data", (chunk) => {
    chunks.push(chunk);
  });
  req.on("end", () => {
    const stream_filename = `uploads/${req.params.broadcastID}.webm`;
    Utils.writeDataToFile(Buffer.concat(chunks), stream_filename);
    res.writeHead(200, headers);
    res.end("ok");
  });
};

module.exports = handleDashRequest;
