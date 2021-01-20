const express = require("express");
const fileUpload = require("express-fileupload");
const cors = require("cors");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const app = express();
const port = 3000;
const fs = require("fs");

var middleware = function (req, res, next) {
  console.log(req.buf);
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
};

app.use(cors({ origin: true, credentials: true }));
// app.use(middleware);

app.use(
  bodyParser.raw({
    inflate: true,
    limit: "50mb",
    type: "application/octet-stream",
  })
);

app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.put("/upload", (req, res) => {
  try {
    console.log(req.body);
    const buffer = req.body;
    const queryParams = req.query;

    const segment_filename = `uploads/${queryParams.broadcastID}_${queryParams.filename}`;
    const stream_filename = `uploads/${queryParams.broadcastID}.webm`;
    fs.writeFile(segment_filename, buffer, function (err) {
      if (err) return console.log(err);
      console.log("Wrote file " + segment_filename);
    });
    if (queryParams.filename != "dash_manifest.mpd") {
      // Manifest file doesn't need to be written to the stream file
      fs.appendFile(stream_filename, buffer, function (err) {
        if (err) return console.log(err);
        console.log("Wrote file " + stream_filename);
      });
    }

    res.status(200).send({
      status: true,
      message: "blind success",
    });
  } catch (e) {
    console.log(e);
    res.status(200).send({
      status: true,
      message: "error, but give 200 anyway",
    });
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
