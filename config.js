const _ = require("lodash");

module.exports = {
    'err_func': function (req, res, error) {
        if (res) {
            if (!res.headersSent)
                res.json({success: false, message: 'SOME ERROR'});
        }
        console.dir('Error caught in err_func', {colors: true});
        console.dir(error, {colors: true});
    },
    'err_func_status': (req, res, error) => {
        if (res) {
            if (!res.headersSent)
                res.status(400).json({message: 'SOME ERROR'});
        }
        console.dir('Error caught in err_func_status', {colors: true});
        console.dir(error, {colors: true});
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
};
