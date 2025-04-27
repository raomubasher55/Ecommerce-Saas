const express = require("express");
const {
  saveSubscription,
  getSubscription,
} = require("../controllers/subscriptionController");

const router = express.Router();

router.put("/subscription", saveSubscription);
router.get("/subscription", getSubscription);

module.exports = router;
