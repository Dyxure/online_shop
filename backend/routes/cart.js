const router = require("express").Router();
const controller = require("../controllers/cartController");

router.get("/", controller.getCart);
router.post("/add", controller.addToCart);
router.post("/update", controller.update);
router.post("/remove", controller.remove);

module.exports = router;