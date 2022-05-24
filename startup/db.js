const winston = require('winston');
const mongoose = require('mongoose')
const config = require('config');
const dbConfig = config.get('dbConf');

module.exports = function () {
    const url = 'mongodb://' + dbConfig.host + '/' + dbConfig.db
    mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify : false, useCreateIndex : true })
        .then(console.log('Connected to MongoDB..'))
}