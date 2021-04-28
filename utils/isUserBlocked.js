const User = require("../models/user");

exports.isUserBlocked = async (userId) => {
	const user = await User.findById(userId);
	return user.blocked;
};
