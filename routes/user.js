const express = require("express");
const { body } = require("express-validator/check");

const isAuth = require("../middleware/is-auth");
const isAdmin = require("../middleware/is-admin");

const userController = require("../controllers/user");
const User = require("../models/user");

const router = express.Router();

router.get("/", isAuth, isAdmin, userController.getUsers);

router.get("/:id/words", isAuth, isAdmin, userController.getWords);

router.get("/:id/units", isAuth, isAdmin, userController.getUnits);

router.get("/:id", isAuth, userController.getUser);

router.post("/:id/unit", isAuth, isAdmin, userController.unitUser);

router.post("/:id/ununit", isAuth, isAdmin, userController.ununitUser);

router.patch("/:id", isAuth, userController.updateUser);

router.delete("/:id", isAuth, userController.deleteUser);

router.get("/:id/words/:wordId", isAuth, userController.getWord);

router.get("/:id/units/:unitId", isAuth, userController.getUnit);

module.exports = router;
