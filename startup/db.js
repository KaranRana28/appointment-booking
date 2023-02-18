const winston = require('winston');
const mongoose = require('mongoose')
const config = require('config');
const dbConfig = config.get('dbConf');

module.exports = function () {
    // const url = 'mongodb://' + dbConfig.host + '/' + dbConfig.db
    const url = 'mongodb+srv://itsmekaran:V8zcvAWO1YT3oWz8@appointme.qtgynjp.mongodb.net/appoint-me?authSource=admin&replicaSet=atlas-up7kep-shard-0&w=majority&readPreference=primary&retryWrites=true&ssl=true'
    mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })
        .then(console.log('Connected to MongoDB..'))
        .catch((err) => console.log(err));
}