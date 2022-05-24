const wiston = require('winston')

module.exports = function (err, req, res, next) {
    wiston.error(err.message, err);
    res.status(500).send('Internal server error.')
}