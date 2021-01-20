const express = require("express");
const fileUpload = require("express-fileupload");
const cors = require("cors");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const app = express();
const port = 3000;

var middleware = function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
};

// enable files upload
app.use(
  fileUpload({
    createParentPath: true,
  })
);

//add other middleware
app.use(cors({ origin: true, credentials: true }));
// app.use(middleware);

// var options = {
//   inflate: true,
//   limit: '10000kb',
//   type: 'application/octet-stream'
// };
// app.use(bodyParser.raw(options));


app.use(bodyParser.json({
  verify: (req, res, buf) => {
    console.log({req, res, buf});
    req.rawBody = buf
  }
}))
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.raw());

app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.put("/upload", (req, res) => {
  var contype = req.headers['content-type'];
  console.log(contype);

  console.log(req);
  console.log(req.rawBody);

  if (!req.files) {
    console.log("no files!");
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
