const router = require("express").Router();
const controller = require("../controllers/ordersController");

router.get("/", controller.list);
router.get("/:id", controller.getOne);
router.post("/", controller.create);

module.exports = router;