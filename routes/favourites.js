const express = require("express");
const { body } = require("express-validator/check");

const isAuth = require("../middleware/is-auth");

const userController = require("../controllers/user");

const router = express.Router();

router.get("/", isAuth, userController.getFavouritesUnits);

router.post("/:unitId", isAuth, userController.addFavouritesUnits);

router.delete("/:unitId", isAuth, userController.deleteFavouritesUnits);

module.exports = router;
