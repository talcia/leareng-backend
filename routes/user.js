const express = require('express');

const isAuth = require('../middleware/is-auth');
const isAdmin = require('../middleware/is-admin');
const isAdminOrCreator = require('../middleware/is-admin-or-creator');
const skipRouteMiddleware = require('../middleware/skip-route-middleware');

const userController = require('../controllers/user');

const router = express.Router();

router.get('/', isAuth, isAdmin, userController.getUsers);

router.get('/:id/words', isAuth, userController.getWords);

router.get('/:id/units', isAuth, userController.getUnits);

router.get('/:id', isAuth, skipRouteMiddleware, userController.getUserShorter);

router.get('/:id', isAuth, isAdminOrCreator, userController.getUser);

router.post('/:id/block', isAuth, isAdmin, userController.blockUser);

router.post('/:id/unblock', isAuth, isAdmin, userController.unblockUser);

router.patch('/:id', isAuth, userController.updateUser);

router.patch('/:id/avatar', isAuth, userController.updateUserAvatar);

router.delete('/:id', isAuth, userController.deleteUser);

router.get('/:id/words/:wordId', isAuth, userController.getWord);

router.get('/:id/units/:unitId', isAuth, userController.getUnit);

module.exports = router;
