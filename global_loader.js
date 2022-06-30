module.exports = function (next) {
    if (!global.config) {
        const Promise = require('bluebird');
        global.config = require('./config');
        global.Promise = require('bluebird');
        process.on("unhandledRejection", function (reason, promise) {
            config.err_func(null, null, reason);
        });
        global.mailer = require("nodemailer").createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true, // true for 465, false for other ports
            auth: {
                user: config.EmailService.user,
                pass: config.EmailService.pass, // generated ethereal password
            },
        });
        global.express = require('express')
        global.os = require('os');
        global._ = require('lodash');
        global.url = require('url');
        global.fs = require('fs');
        global.path = require('path');
        global.exec = require('child_process').exec;
        global.http = require('http');
        global.https = require('https');
        global.err_func = config.err_func;
        global.bodyParser = require('body-parser');
        global.got = require('got');
        global.json2csv = require('json2csv');
        global.global_packages_path = path.join(path.dirname(path.dirname(process.execPath)), 'lib/node_modules'); //npm config get prefix
        global.log = (...item) => {
            console.log(...item);
        };
        global.pgp = require('pg-promise')({promiseLib: Promise});
        const connectionJSON = config.connectionJSON();

        function check_db_chain(index) {
            connectionJSON.host = connectionJSON.list_hosts[index];
            global.db = pgp(connectionJSON);
            global.db.one('select pg_is_in_recovery();')
                .then(async result => {
                    if (result.pg_is_in_recovery) {
                        return check_db_chain(index + 1);
                    } else {
                        if (_.isFunction(next)) {
                            next();
                        }
                    }
                })
                .catch(error => {
                    console.log(error);
                    return check_db_chain(index + 1);
                })
        }

        check_db_chain(0);
    }
};

//do not require services.js, ever! as it requires global_loader
