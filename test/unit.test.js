const expect = require('chai').expect;
const bcrypt = require('bcryptjs');
const chai = require('chai');
const app = require('../app');
const mongoose = require('mongoose');

let chaiHttp = require('chai-http');
let should = chai.should();

const Unit = require('../models/Unit');
const User = require('../models/User');
chai.use(chaiHttp);

let token = '';

describe('Unit', () => {
	before(async () => {
		const user = new User({
			email: 'test@test.com',
			password: await bcrypt.hash('tester', 12),
			name: 'TESTER',
			active: true,
			_id: '5c0f66b979af55031b34728a',
		});
		await user.save();

		const res = await chai
			.request(app)
			.post('/auth/login')
			.send({ email: 'test@test.com', password: 'tester' });

		token = res.body.token;
	});
	it('POST /units should yield that user email is not confirm', async () => {
		const user_not_confirmed = new User({
			email: 'test2@test.com',
			password: await bcrypt.hash('tester', 12),
			name: 'TESTER',
			_id: '5c0f66b979af55031b34728b',
		});
		await user_not_confirmed.save();
		const res_auth = await chai
			.request(app)
			.post('/auth/login')
			.send({ email: 'test2@test.com', password: 'tester' });

		const unit = {
			name: 'vehicles',
			fromLang: 'PL',
			private: false,
			toLang: 'EN',
		};
		const res = await chai
			.request(app)
			.post('/units')
			.send(unit)
			.set({ Authorization: `Bearer ${res_auth.body.token}` });
		const err = JSON.parse(res.error.text);
		expect(err.message).to.equal('Email is not confirm');
		expect(err.status).to.equal(401);

		await User.findByIdAndRemove(user_not_confirmed._id);
	});
	it('POST /units should create an unit', async () => {
		const unit = {
			name: 'vehicles',
			fromLang: 'PL',
			private: false,
			toLang: 'EN',
		};
		const res = await chai
			.request(app)
			.post('/units')
			.send(unit)
			.set({ Authorization: `Bearer ${token}` });
		expect(res.body.message).to.equal('Unit created');
		expect(res.body.unit.name).to.equal('vehicles');
	});

	it('GET /units should return an units', async () => {
		const res = await chai
			.request(app)
			.get('/units')
			.set({ Authorization: `Bearer ${token}` });
		expect(res.body.units.length).not.to.equal(0);
	});

	it('GET /unit/:id should return an unit with specific id', async () => {
		const unit = new Unit({
			_id: '5c0f66b979af55031b34728c',
			name: 'vehicles',
			fromLang: 'PL',
			private: false,
			toLang: 'EN',
			creator: mongoose.Types.ObjectId('5c0f66b979af55031b34728a'),
		});
		await unit.save();
		const res = await chai
			.request(app)
			.get('/units/5c0f66b979af55031b34728c')
			.set({ Authorization: `Bearer ${token}` });
		expect(res.status).to.equal(200);
		expect(res.body.unit).to.have.property('name');
		expect(res.body.unit).to.have.property('fromLang');
	});

	it('GET /unit/:id should yield that unit does not exists', async () => {
		const res = await chai
			.request(app)
			.get('/units/5c0f66b979af55031b34728d')
			.set({ Authorization: `Bearer ${token}` });
		expect(res.body.message).to.equal('unit with this id not find');
		expect(res.body.status).to.equal(404);
	});

	it('PATCH /units/:id should return an update unit', async () => {
		const unit = new Unit({
			name: 'animals',
			fromLang: 'PL',
			toLang: 'EN',
		});
		const res = await chai
			.request(app)
			.patch('/units/5c0f66b979af55031b34728c')
			.send(unit)
			.set({ Authorization: `Bearer ${token}` });
		expect(res.status).to.equal(201);
		expect(res.body.unit.name).to.equal('animals');
		expect(res.body.unit.toLang).to.equal('EN');
	});

	it('PATCH /units/:id should yield that invalid data passed', async () => {
		const unit = new Unit({
			fromLang: 'PL',
			toLang: 'EN',
		});
		const res = await chai
			.request(app)
			.patch('/units/5c0f66b979af55031b34728c')
			.send(unit)
			.set({ Authorization: `Bearer ${token}` });
		expect(res.body.status).to.equal(422);
		expect(res.body.message).to.equal('Validation faild');
	});

	it('POST /units/:id/words should add word to unit with specific id', async () => {
		const word = {
			word: 'kot',
			translation: 'cat',
			fromLang: 'PL',
			toLang: 'EN',
		};
		const res = await chai
			.request(app)
			.post('/units/5c0f66b979af55031b34728c/words')
			.send(word)
			.set({ Authorization: `Bearer ${token}` });

		expect(res.status).to.equal(201);
		expect(res.body.message).to.equal('Word succesfully added to unit');
		expect(res.body.word.word).to.equal('kot');
		expect(res.body.word.translation).to.equal('cat');
	});

	it('GET /units/:id/words should return word from unit with specific id', async () => {
		const res = await chai
			.request(app)
			.get('/units/5c0f66b979af55031b34728c/words')
			.set({ Authorization: `Bearer ${token}` });

		expect(res.status).to.equal(200);
		expect(res.body.unitId).to.equal('5c0f66b979af55031b34728c');
		expect(res.body.words).not.to.equal(null);
	});

	it('DELETE /units/:id should delete an unit with specific id', async () => {
		const res = await chai
			.request(app)
			.delete('/units/5c0f66b979af55031b34728c')
			.set({ Authorization: `Bearer ${token}` });
		expect(res.status).to.equal(200);
		expect(res.body.unit).to.equal('Unit deleted');
	});

	after(async () => {
		const user = await User.findOne({ email: 'test@test.com' });
		await User.findByIdAndRemove(user._id);
		await Unit.deleteMany({});
	});
});
