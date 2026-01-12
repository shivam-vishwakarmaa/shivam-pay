const express = require("express");
const app = express();
const cors = require("cors");
const port = 3000;

const mainRouter = require("./routes/main.js");

app.use(cors());
app.use(express.json());
app.use("/pytm", mainRouter);

app.listen(port, () => {
  console.log(`running on port ${port}`);
});
