const expect = require("chai").expect;
const bcrypt = require("bcryptjs");
const chai = require("chai");
const app = require("../app");
const mongoose = require("mongoose");

let chaiHttp = require("chai-http");
let should = chai.should();

const Word = require("../models/word");
const Unit = require("../models/unit");
const User = require("../models/user");
chai.use(chaiHttp);

let token = "";

describe("Word", () => {
	before(async () => {
		const user = new User({
			email: "test@test.com",
			password: await bcrypt.hash("tester", 12),
			name: "TESTER",
			active: true,
			_id: "5c0f66b979af55031b34728a",
		});
		await user.save();

		const res = await chai
			.request(app)
			.post("/auth/login")
			.send({ email: "test@test.com", password: "tester" });

		token = res.body.token;

		const unit = new Unit({
			_id: "5c0f66b979af55031b34728c",
			name: "vehicles",
			fromLang: "PL",
			private: false,
			toLang: "EN",
			creator: mongoose.Types.ObjectId("5c0f66b979af55031b34728a"),
		});
		await unit.save();

		const word = new Word({
			_id: "5c0f66b979af55031b34728d",
			word: "kot",
			unit: mongoose.Types.ObjectId("5c0f66b979af55031b34728c"),
			translation: "cat",
			fromLang: "PL",
			toLang: "EN",
			creator: mongoose.Types.ObjectId("5c0f66b979af55031b34728a"),
		});

		const word2 = new Word({
			_id: "5c0f66b979af55031b34728e",
			word: "mysz",
			unit: mongoose.Types.ObjectId("5c0f66b979af55031b34728c"),
			translation: "mouse",
			fromLang: "PL",
			toLang: "EN",
			creator: mongoose.Types.ObjectId("5c0f66b979af55031b34728a"),
		});
		await word.save();
		await word2.save();
		unit.words.push(word._id);
		unit.words.push(word2._id);
		await unit.save();
	});
	it("GET /words should return all words", async () => {
		const res = await chai
			.request(app)
			.get("/words")
			.set({ Authorization: `Bearer ${token}` });
		expect(res.body.words).not.to.equal(null);
		expect(res.status).to.equal(200);
	});
	it("GET /words/:id should return word with specific id", async () => {
		const res = await chai
			.request(app)
			.get("/words/5c0f66b979af55031b34728d")
			.set({ Authorization: `Bearer ${token}` });
		expect(res.body.word.word).to.equal("kot");
		expect(res.status).to.equal(200);
	});

	it("PATCH /words/:id should return an updated word", async () => {
		const word = {
			word: "pies",
			translation: "dog",
			fromLang: "PL",
			toLang: "EN",
		};
		const res = await chai
			.request(app)
			.patch("/words/5c0f66b979af55031b34728d")
			.send(word)
			.set({ Authorization: `Bearer ${token}` });
		expect(res.body.word.word).to.equal("pies");
		expect(res.status).to.equal(201);
	});

	it("DELETE /words/:id should delete word with specific id", async () => {
		const res = await chai
			.request(app)
			.delete("/words/5c0f66b979af55031b34728d")
			.set({ Authorization: `Bearer ${token}` });
		expect(res.body.word).to.equal("Word deleted");
		expect(res.status).to.equal(200);
	});

	it("DELETE /words/:id should yield that word with this id doesn't exisist", async () => {
		const res = await chai
			.request(app)
			.delete("/words/5c0f66b979af55031b34728d")
			.set({ Authorization: `Bearer ${token}` });
		expect(res.body.message).to.equal("Could not find word");
		expect(res.error.status).to.equal(404);
	});

	it("GET /words/:fromLang/:toLang should return word from specific language to specific language", async () => {
		const res = await chai
			.request(app)
			.get("/words/PL/EN")
			.set({ Authorization: `Bearer ${token}` });
		expect(res.body.words).not.to.equal(null);
		expect(res.body.words[0]).to.have.property("word");
		expect(res.status).to.equal(200);
	});

	it("GET /words/:fromLang/:toLang/:randomNumber should return specific number of word from specific language to specific language", async () => {
		const res = await chai
			.request(app)
			.get("/words/PL/EN/1")
			.set({ Authorization: `Bearer ${token}` });

		expect(res.body.words.length).to.equal(1);
		expect(res.body.words[0]).to.have.property("word");
		expect(res.status).to.equal(200);
	});

	after(async () => {
		const user = await User.findOne({ email: "test@test.com" });
		await User.findByIdAndRemove(user._id);
		await Unit.deleteMany({});
		await Word.deleteMany({});
	});
});
