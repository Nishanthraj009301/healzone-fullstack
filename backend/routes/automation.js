const express = require("express");
const router = express.Router();

router.post("/", (req, res) => {
  console.log("Automation Data Received:", req.body);

  res.json({
    message: "Automation data received successfully"
  });
});

module.exports = router;