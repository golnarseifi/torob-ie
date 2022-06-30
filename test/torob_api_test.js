const got = require('got');

const base_url = 'http://localhost:5000';
const Promise = require('bluebird');
const {it} = require("mocha");
require('../global_loader')();

async function get(url, token) {
    return got.get(base_url + url, {
        headers: {
            ...(token && {'Authorization': `${token}`})
        }
    }).json();
}

async function post(url, body, token) {
    return got.post(base_url + url, {
        json: body,
        headers: {
            'Content-Type': 'application/json',
            ...token && {'Authorization': `${token}`}
        }
    }).json();
}

async function put(url, body, token) {
    return got.put(base_url + url, {
        json: body,
        headers: {
            'Content-Type': 'application/json',
            ...token && {'Authorization': `${token}`}
        }
    }).json();
}

async function remove(url, body, token) {
    return got.delete(base_url + url, {
        json: body,
        headers: {
            'Content-Type': 'application/json',
            ...token && {'Authorization': `${token}`}
        }
    }).json();
}

describe('Torob Api', async () => {

    it('/customer/register', async () => {
        const result = await post("/api/customer/register", {
            email: 'golnaarrseifii@gmail.com',
            password: ' 12345678'
        });

        console.log(result);
    });

   it('/customer/verify', async () => {
        const result = await post("/api/customer/verify", {
            email: 'golnaarrseifii@gmail.com',
            code: '90155'
        });

        console.log(result);
    });

   it('/customer/login', async () => {
        const result = await post("/api/customer/login", {
            email: 'golnaarrseifii@gmail.com',
            password: ' 12345678'
        });

        console.log(result);
    });


});