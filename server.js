const express = require("express");
const app = express();

app.use(express.json());

const libraryRoute = require("./routes/library");

app.get("/", (req, res) => {
  res.send("hello");
});

app.use("/api/library", libraryRoute);

app.listen(5500, () => {
  console.log("server start in port : 5500"); 
});