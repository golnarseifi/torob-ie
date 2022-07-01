const router = require("express").Router();
const _ = require("lodash");
const moment = require("moment");
const crypto = require("crypto");
require('../global_loader')();
const serverInTestingMode = true;
if (serverInTestingMode)
	console.log('Server Torob in Test Mode');

function err_func(req, res, error) {
	if (res) {
		if (!res.headersSent) {
			res.status(403).json({success: false, message: 'SOME ERROR'});
		}
	}
	console.dir('Error caught in client err_func', {colors: true});
	console.dir(error, {colors: true});
	console.dir({url: req.originalUrl, body: req.body}, {colors: true});
}

function handle_error(func) {
	return function (req, res, next) {
		return Promise.resolve().then(async () => {
			return await func(req, res, next);
		}).catch(error => {
			return err_func(req, res, error);
		});
	};
}

router.use(handle_error(async (req, res, next) => next()));

async function send_email(email, code) {
	const res_mailer = await mailer.sendMail({
		from: '<torobproject@gmail.com>', to: email, subject: "torob code"
		// , text: `I feel loved when ${item.text}.`
		, html: `<i>${code} is your Torob authentication code</i>`
	}).catch(error => {
		console.log(error);
	});
	log(res_mailer);
}

async function send_otp(t, email, customer, res) {
	const code = _.random(1e4, 1e5 - 1);
	await t.one(`INSERT INTO otp (email, code)
                 VALUES ($1, $2) RETURNING *`, [email, code]);
	await send_email(email, code, res);
	if (!serverInTestingMode) {
		console.log(`${code} is your Torob authentication code.`);
	}
	const output = {success: true, data: customer};
	if (serverInTestingMode) output['code'] = code;
	return res.json(output);
}

// async function createCustomerSession(customer_id) {
// 	const customer = {
// 		id: customer_id,
// 		token_creation_time: config.current_date_with_milliseconds_url_safe(),
// 	};
// 	const hmac = crypto.createHmac('sha512', config.CustomerApp.Redis.SessionSecrets[0]);
// 	let hex = hmac.update(JSON.stringify(customer)).digest('hex');
// 	hex = [customer.id, hex].join('-');
// 	await utility.redis.redis_set([config.CustomerApp.Redis.SessionPrefixes, hex], JSON.stringify(customer));
// 	return hex;
// }

router.post('/customer/register', handle_error(async (req, res) => {
	let email = req.body.email;
	let password = req.body.password;
	email = config.properFormatEmail(email);

	if (!email || !password)
		return res.status(200).json({success: false, message: 'email or password are wrong'});

	password = config.properFormatPassword(password);
	await db.task(async t => {
		let customer = await t.oneOrNone(`SELECT *
                                          FROM customer
                                          where email = $1`, [email]);
		if (customer)
			return res.status(200).json({success: false, errors: ['customer_already_has_an_account']});

		customer = await t.one(`INSERT INTO customer (email, password)
                                VALUES ($1, $2) RETURNING *`, [email, password]);

		await send_otp(t, email, customer, res);

	});

	return res.status(200).json({success: true});

}));

router.post("/customer/verify", handle_error(async (req, res) => {

	const code = req.body.code;
	let email = req.body.email;

	email = config.properFormatEmail(email);

	if (!code || !email)
		return res.status(200).json({success: false, message: 'code or email are wrong'});

	await db.task(async t => {

		let codes = await t.any(`SELECT code
                                 from otp
                                 WHERE email = $1;`,
			[email]
		);

		if (!codes.map(e => e.code).includes(code)) {
			return res.json({success: false, errors: [{"param": "code", message: "code_is_not_correct"}]});
		}

		let customer = await t.oneOrNone(`SELECT *
                                          FROM customer
                                          WHERE email = $1`, [email]);

		if (!customer) {
			customer = await t.one(`INSERT INTO customer (email)
                                    VALUES ($1) RETURNING *`, {email});
		}

		email = email || customer.email;

		// const last_login = moment().format('YYYY-MM-DD HH:mm:ss');


		// let token = await createCustomerSession(customer.id);
		// TODO: create token
		let token = '';
		await t.none(`DELETE
                      FROM otp
                      WHERE email = $1;`, [email]);

		return res.json({success: true, data: {token, customer_id: customer.id}});
	});


}));

router.post('/customer/login', handle_error(async (req, res) => {
	let email = req.body.email;
	let password = req.body.password;

	email = config.properFormatEmail(email);
	password = config.properFormatPassword(password);

	if (!email || !password)
		return res.status(200).json({success: false, message: 'email or password is wrong'});

	await db.task(async t => {
		let customer = await t.oneOrNone(`SELECT *
                                          FROM customer
                                          where email = $1`, [email]);
		if (!customer)
			return res.status(200).json({success: false, errors: ['customer_does_not_exist']});

		if (customer.password !== password)
			return res.status(200).json({success: false, errors: ['password_is_wrong']});


		// let token = await createCustomerSession(customer.id);
		let token = '';
		return res.json({success: true, data: {token, customer: customer}});

	});
}));

router.post('/customer/get_categories', handle_error(async (req, res) => {
	let categories = [];
	// let sub_categories = [];
	// let children = [];
	await db.task(async t => {
		 categories = await t.any(`SELECT *
										  FROM category`);
		// categories.push(categories);

		//  await Promise.mapSeries(main_categories, async main_category => {
		// 	  sub_categories = await t.any(`SELECT *
		// 								  FROM category
		// 								  WHERE parent_id = main_category.id`);
		//
		// 	 await Promise.mapSeries(sub_categories, async sub_category => {
		// 		 children = await t.any(`SELECT *
		// 								  FROM category
		// 								  WHERE parent_id = sub_category.id`);
		// 	 });
		//
		// });


		return res.json({success: true, data: categories});
	})

	}));

router.post('/customer/get_all_products', handle_error(async (req, res) => {
	await db.task(async t => {
		let products = await t.any(`SELECT product_store.*, product.title, product.category_id
                                    FROM product_store
                                             LEFT JOIN product ON product.ID = product_id
                                    WHERE product_store.price = (SELECT MIN(price) FROM product_store WHERE product_id = product_store.product_id)`);
		return res.json({success: true, data: products});
	});
}));

router.post('/customer/get_products_by_product_id', handle_error(async (req, res) => {
	await db.task(async t => {
		let product_page = await t.any(`SELECT product_store.*,
                                          product.title,
                                          product.category_id
                                   FROM product_store
                                            LEFT JOIN product ON product.ID = product_id
                                            LEFT JOIN store ON store."id" = product_store.store_id
                                   WHERE product_id = 1000`);
		return res.json({success: true, data: product_page});
	});
}));

module.exports = router;

