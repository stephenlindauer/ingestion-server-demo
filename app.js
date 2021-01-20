const express = require("express");
const fileUpload = require("express-fileupload");
const cors = require("cors");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const app = express();
const port = 3000;

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


app.use(bodyParser.raw({
  inflate: true,
  limit: "50mb",
  type: "application/octet-stream",
}));

app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.put("/upload", (req, res) => {
  try {
    var contype = req.headers["content-type"];
    console.log(contype);

    // console.log(req);
    console.log(req.body);

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
  return;

  if (!req.files) {
    console.log("[no files!");
    res.status(400).send({
      status: false,
      message: "No file uploaded",
    });
  } else {
    console.log(req.files);
    //Use the name of the input field (i.e. "avatar") to retrieve the uploaded file
    let avatar = req.files.avatar;

    //Use the mv() method to place the file in upload directory (i.e. "uploads")
    avatar.mv("./uploads/" + avatar.name);

    //send response
    res.send({
      status: true,
      message: "File is uploaded",
      data: {
        name: avatar.name,
        mimetype: avatar.mimetype,
        size: avatar.size,
      },
    });
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
