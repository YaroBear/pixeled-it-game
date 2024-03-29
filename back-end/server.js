const express = require("express");
const path = require("path");
const cors = require("cors");

const app = express();

app.use(cors());

app.use("/img", express.static(path.join(__dirname, "img")));

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
