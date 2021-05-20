const expect = require("chai").expect;
const bcrypt = require("bcryptjs");
const chai = require("chai");
const app = require("../app");

let chaiHttp = require("chai-http");
let should = chai.should();

const User = require("../models/user");
chai.use(chaiHttp);

describe("Auth Controller - Signup", () => {
	it("should send a response that password is too short and email is invalid", async () => {
		const res = await chai.request(app).post("/auth/signup").send({
			email: "test2",
			password: "tester",
			name: "TESTER2",
		});
		const data = JSON.parse(res.text).data;
		expect(res.status).to.equal(422);
		expect(data[0].msg).to.equal("Please enter a valid email");
		expect(data[1].msg).to.equal(
			"Password must be at least 8 character long"
		);
	});
	it("should send a response with a user email and message that email sent", async () => {
		const res = await chai.request(app).post("/auth/signup").send({
			email: "test2@test.com",
			password: "tester02",
			name: "TESTER2",
		});
		expect(res.status).to.equal(201);
		should.not.equal(res.body.email, null);
		expect(res.body.message).to.equal("User created");
	});

	it("should throw error that user with email already exists", async () => {
		const res = await chai.request(app).post("/auth/signup").send({
			email: "test2@test.com",
			password: "tester02",
			name: "TESTER2",
		});
		const data = JSON.parse(res.text).data[0];
		expect(res.status).to.equal(422);
		expect(data.msg).to.equal(
			"User with this email address already exists"
		);
	});

	after(async () => {
		const user = await User.findOne({ email: "test2@test.com" });
		await User.findByIdAndRemove(user._id);
	});
});
describe("Auth Controller - Login", () => {
	before(async () => {
		const user = new User({
			email: "test@test.com",
			password: await bcrypt.hash("tester", 12),
			name: "TESTER",
			_id: "5c0f66b979af55031b34728a",
		});
		await user.save();
	});

	it("should send a response that user data is invalid", async () => {
		const res = await chai.request(app).post("/auth/login").send({
			email: "test2@test.com",
			password: "tester2",
		});
		const data = JSON.parse(res.error.text).message;
		expect(res.status).to.equal(422);
		expect(data).to.equal("Invalid user data");
	});

	it("should send a response with a user token", async () => {
		const res = await chai
			.request(app)
			.post("/auth/login")
			.send({ email: "test@test.com", password: "tester" });

		expect(res.status).to.equal(200);
		should.not.equal(res.body.token, null);
		expect(res.body.userId).to.have.length(24);
	});

	after(async () => {
		await User.findByIdAndRemove("5c0f66b979af55031b34728a");
	});
});

describe("Auth Controller - Confirm Email", () => {
	it("should send a response that token is invalid", async () => {
		const res = await chai
			.request(app)
			.get("/auth/confirmEmail/exampletokenthatisnotvalid1234");

		const data = JSON.parse(res.error.text).message;
		expect(res.status).to.equal(404);
		expect(data).to.equal("Token not found");
	});
});

describe("Auth Controller - Password Change", () => {
	it("should send a response that token is invalid", async () => {
		const res = await chai
			.request(app)
			.post("/auth/resetPassword/exampletokenthatisnotvalid1234", {
				password: "newPassword",
			});
		const data = JSON.parse(res.error.text).message;
		expect(res.status).to.equal(404);
		expect(data).to.equal("Token not found");
	});
});
