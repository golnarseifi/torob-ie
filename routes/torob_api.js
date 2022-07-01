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

router.post('/customer/add_new_product', handle_error(async (req, res) => {
	let product_id = req.body.product_id;
	let category_id = req.body.category_id;
	let store_id = req.body.store_id;
	let price = req.body.price;
	let url = req.body.url;

	if (!product_id || !store_id || !price || !url)
		return res.status(200).json({success: false, message: 'product_id or store_id or price or quantity is wrong'});

	await db.task(async t => {

		let product = await t.oneOrNone(`SELECT * FROM product WHERE title = $1`, [title]);

		if (product)
			return res.status(200).json({success: false, errors: ['product_already_exist']});

		 product = await t.oneOrNone(`INSERT INTO product (title, category_id)
                                         VALUES ($1, $2) RETURNING *`, [title, category_id]);

		let product_store = await t.oneOrNone(`SELECT *
												FROM product_store
												WHERE product_id = $1 AND store_id = $2`, [product.id, store_id]);
		if (product_store)
			return res.status(200).json({success: false, errors: ['product_already_exists_in_store']});

		let store_product = await t.oneOrNone(`INSERT INTO product_store (product_id, store_id, price, url)
											VALUES ($1, $2, $3, $4) RETURNING *`, [product.id, store_id, price, url]);

		return res.json({success: true, data: store_product});
	});
}));

router.post('/customer/add_product_from_list', handle_error(async (req, res) => {
	let product_id = req.body.product_id;
	let store_id = req.body.store_id;
	let price = req.body.price;
	let url = req.body.url;

	if (!product_id || !store_id || !price || !url)
		return res.status(200).json({success: false, message: 'product_id or store_id or price or quantity is wrong'});

	await db.task(async t => {

		let product_store = await t.oneOrNone(`SELECT *
												FROM product_store
												WHERE product_id = $1 AND store_id = $2`, [product.id, store_id]);
		if (product_store)
			return res.status(200).json({success: false, errors: ['product_already_exists_in_store']});

		let store_product = await t.oneOrNone(`INSERT INTO product_store (product_id, store_id, price, url)
											VALUES ($1, $2, $3, $4) RETURNING *`, [product_id, store_id, price, url]);

		return res.json({success: true, data: store_product});
	});
}));

router.post('/customer/get_products_list', handle_error(async (req, res) => {
	await db.task(async t => {
		let products = await t.oneOrNone(`SELECT *
												FROM product`);
		return res.json({success: true, data: products});
	});
}));

router.post('/customer/set_product_favorite_status', handle_error(async (req, res) => {
	let product_id = req.body.product_id;
	let status = req.body.status;

	if (!product_id || !status)
		return res.status(200).json({success: false, message: 'product_id or status is wrong'});

	await db.task(async t => {
		let product = await t.oneOrNone(`UPDATE product SET favorite = $1 WHERE ID = $2 RETURNING *`, [status, product_id]);
		return res.json({success: true, data: product});
	});
}));

router.post('/customer/report_store', handle_error(async (req, res) => {
	let store_id = req.body.store_id;
	let customer_id = req.body.customer_id;
	let description = req.body.description;

	if (!store_id || !description || !customer_id)
		return res.status(200).json({success: false, message: 'store_id or description or customer_id is wrong'});

	await db.task(async t => {
		let report = await t.oneOrNone(`INSERT INTO report (store_id, description, customer_id)
										VALUES ($1, $2, $3) RETURNING *`, [store_id, description, customer_id]);
		return res.json({success: true, data: report});
	});
}));

router.post('/customer/get_favorite_list', handle_error(async (req, res) => {
	let customer_id = req.body.customer_id;
	await db.task(async t => {
		let favorites = await t.any(`SELECT * FROM customer_favorite WHERE customer_id = $1`, [customer_id]);

		return res.json({success: true, data: favorites});
	});

	}));

router.post('/customer/add_store', handle_error(async (req, res) => {
	let admin_id = req.body.admin_id;
	await db.task(async t => {
		let store = await t.oneOrNone(`INSERT INTO store (admin_id)
										VALUES ($1) RETURNING *`, [admin_id]);
		return res.json({success: true, data: store});
	})
	}));

router.post('/customer/get_store_list', handle_error(async (req, res) => {
	let admin_id = req.body.admin_id;

	await db.task(async t => {
		let stores = await t.any(`SELECT * FROM store where admin_id = $1`, [admin_id]);
		return res.json({success: true, data: stores});
	});
}));

module.exports = router;

