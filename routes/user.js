const express = require("express");
const { body } = require("express-validator/check");

const isAuth = require("../middleware/is-auth");
const isAdmin = require("../middleware/is-admin");

const userController = require("../controllers/user");
const User = require("../models/user");

const router = express.Router();

router.get("/", isAuth, isAdmin, userController.getUsers);

router.get("/:id/words", isAuth, isAdmin, userController.getWords);

router.get("/:id", isAuth, userController.getUser);

router.post("/:id/block", isAuth, isAdmin, userController.blockUser);

router.patch("/:id", isAuth, userController.updateUser);

router.delete("/:id", isAuth, userController.deleteUser);

router.get("/:id/words/:wordId", isAuth, userController.getWord);

module.exports = router;
