const winston = require('winston');
require('winston-mongodb');
require('express-async-errors');

// module.exports = function () {
//     winston.handelExceptions(
//         new winston.transports.File({ filename: 'uncaughtExceptions.log' })
//     )

//     process.on('unhandledRejection', (ex) => {
//         throw ex;
//     })

//     winston.add(winston.transports.File, { filename: 'logfile.log' });
//     winston.add(winston.transports.MongoDB, {
//         db : "mongodb://localhost/calendly",
//         level: "info"
//     });
// }

module.exports = function () {
    winston.exceptions.handle(
        new winston.transports.Console({colorsize: true, prettyPrint:true}),
        new winston.transports.File({ filename: 'uncaughtExceptions.log' })
    );

    process.on('uncaughtExceptions', (ex) => {
        throw ex;
    })


    const logger = winston.createLogger({
        level: 'info',
        format: winston.format.json(),
        defaultMeta: { service: 'user-service' },
        transports: [
            new winston.transports.File({ filename: 'error.log', level: 'error' }),
            new winston.transports.File({ filename: 'combined.log' })
        ],
    });

    if (process.env.NODE_ENV !== 'production') {
        logger.add(new winston.transports.Console({
            format: winston.format.simple(),
        }));
    }
}