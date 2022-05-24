const express = require('express');
const users = require('../routes/user');
const business = require('../routes/business');
const customer = require('../routes/customer');
const staff = require('../routes/staff');
const category = require('../routes/category');
const service = require('../routes/service');
const appointment = require('../routes/appointment');
const setting = require('../routes/setting');
const dashboard = require('../routes/dashboard');
const calender = require('../routes/calender');
const home = require('../routes/home');
const post = require('../routes/post');
// const comment = require('../routes/comment');
const error = require('../middleware/error');

module.exports = function (app) {
    const expressSwagger = require('express-swagger-generator')(app);
    const options = {
        swaggerDefinition: {
            info: {
                description: 'Appointment System API Documentation',
                title: 'Appointment Management System',
                version: '1.0.0',
            },
            host: 'localhost:3000',
            basePath: '/api',
            produces: [undefined],
            schemes: ['http', 'https'],
            securityDefinitions: {
                JWT: {
                    type: 'apiKey',
                    in: 'header',
                    name: 'Authorization',
                    description: "",
                }
            }
        },
        basedir: __dirname, //app absolute path
        files: ['../routes/*.js'], // files containing annotations as above
    };
    expressSwagger(options);
    app.use(express.json());
    app.use(express.urlencoded({
        extended: true
    }));
    app.use('/api/user', users);
    app.use('/api/business', business);
    app.use('/api/customer', customer);
    app.use('/api/staff', staff);
    app.use('/api/category', category);
    app.use('/api/service', service);
    app.use('/api/appointment', appointment);
    app.use('/api/setting', setting);
    app.use('/api/dashboard', dashboard);
    app.use('/api/calender', calender);
    app.use('/api/post', post);
    // app.use('/api/comment', comment);
    app.use('/', home);
    app.use(error)
}