const _ = require("lodash");
const {exec, spawn} = require("child_process");
const os = require("os");


module.exports = {
    'err_func': function (req, res, error) {
        if (res) {
            if (!res.headersSent)
                res.json({success: false, message: 'SOME ERROR'});
        }
        console.dir('Error caught in err_func', {colors: true});
        console.dir(error, {colors: true}); // print the error;
    },
    'err_func_status': (req, res, error) => {
        if (res) {
            if (!res.headersSent)
                res.status(400).json({message: 'SOME ERROR'});
        }
        console.dir('Error caught in err_func_status', {colors: true});
        console.dir(error, {colors: true});
    },
    shell_scripts: {
        over_current_machine: function (command) {
            return new Promise(function (resolve, reject) {

                exec(command, {maxBuffer: 1000 * 1024 * 1024}, function (error, stdout, stderr) {
                    if (error)
                        reject(error);
                    else if (_.isString(stdout))
                        resolve(stdout);
                    else
                        reject(stderr);
                });
            });
        },
    },
    EmailService: {
        user: 'torobproject@gmail.com',
        pass: 'hiqsnrcndueadjxb',
    },

    'connectionJSON': function () {
        return {
            list_hosts: ['localhost'],
            user: 'admin',
            password: '123456',
            database: 'torob_db',
            ssl: false,
            poolSize: 25,
        };
    },
    serverBaseUrl: function () {
        return computerIdentity.isProduction() ? "https://pacsbox.scalesops.com" : "http://localhost:5000";
    },
    current_date: function () {
        return new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
    },
    current_date_ISO: () => new Date().toISOString(),
    current_date_url_safe: function () {
        return new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '').replace(/( |:|-)/g, '_');
    },
    current_date_with_milliseconds_url_safe: function () {
        return new Date().toISOString().replace(/T/, ' ').replace(/Z/, '').replace(/( |:|-)/g, '_');
    },
    properFormatPhoneNumber: function (phone_number) {
        if (_.isString(phone_number)) {
            phone_number = _.trim(phone_number).replace(/\s+/g, '');
            if (/^(?:0098|\+98|98|0)?(9\d{9})$/.test(phone_number)) {
                phone_number = /^(?:0098|\+98|98|0)?(9\d{9})$/.exec(phone_number)[1];
                return phone_number;
            } else if (/^(?:\+|00)((?:9[976]\d|8[987530]\d|6[987]\d|5[90]\d|42\d|3[875]\d|2[98654321]\d|9[8543210]|8[6421]|6[6543210]|5[87654321]|4[987654310]|3[9643210]|2[70]|7|1)\d{1,14})$/.test(phone_number)) {
                phone_number = '+' + /^(?:\+|00)((?:9[976]\d|8[987530]\d|6[987]\d|5[90]\d|42\d|3[875]\d|2[98654321]\d|9[8543210]|8[6421]|6[6543210]|5[87654321]|4[987654310]|3[9643210]|2[70]|7|1)\d{1,14})$/.exec(phone_number)[1];
                return phone_number;
            }
        }
        return false;
    },
    isPhoneNumberInternational: function (phone_number) {
        if (_.isString(phone_number)) {
            phone_number = _.trim(phone_number).replace(/\s+/g, '');
            if (/^(?:0098|\+98|98|0)?(9\d{9})$/.test(phone_number))
                return false;
            if (/^(?:\+|00)((?:9[976]\d|8[987530]\d|6[987]\d|5[90]\d|42\d|3[875]\d|2[98654321]\d|9[8543210]|8[6421]|6[6543210]|5[87654321]|4[987654310]|3[9643210]|2[70]|7|1)\d{1,14})$/.test(phone_number))
                return true;
        }
        return false;
    },
    properFormatEmail: function (email_address) {
        if (_.isString(email_address)) {
            email_address = _.toLower(_.trim(email_address));
            if (/^[a-zA-Z0-9._-]+@[a-zA-Z]+\.+[a-zA-Z]+$/.test(email_address)) {
                return email_address;
            }
        }
        return false;
    },
    properFormatPassword: function (password) {
        if (_.isString(password) && !_.isEmpty(password))
            return password;
        else
            return false;
    },
    'UserHome': function () {
        return os.homedir();
    },
};
