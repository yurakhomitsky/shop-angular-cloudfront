const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send(`Container Registry Name: ${process.env.CONTAINER_REGISTRY_NAME}`);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
