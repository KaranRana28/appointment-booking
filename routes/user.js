const auth = require('../middleware/auth');
const { validate, User } = require('../models/user');
const { Customer } = require('../models/customer');
const { Staff } = require('../models/staff');
const { Service } = require('../models/service');
const { Appointment } = require('../models/appointment');
const response = require('../response_model/response');
const express = require('express');
const router = express.Router();
const _ = require('lodash')
const bcrypt = require('bcryptjs');
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi)

/**
 * @typedef Response
 * @property {integer} code.required
 * @property {boolean} success.required
 * @property {string} message.required
 * @property {object} data.required
 */
/**

/**
 * @typedef Error
 * @property {integer} code.required
 * @property {boolean} success.required
 * @property {string} message.required
 * @property {string} error.required
 */
/**

/**
 * @typedef Security
 * @property {string} Authorization.required
 */
/**

/**
 * @typedef ParamsUserId
 * @property {string} id.required
 */
/**

/**
 * @typedef Register
 * @property {string} name.required
 * @property {string} email.required
 * @property {string} password.required
 */
/**
 * @route POST /user/register
 * @group Authentication
 * @param {Register.model} Register.body.required - register model required
 * @returns {Response.model} 200 - User info
 * @returns {Error.model} Default - Unexpected error
 * @produces application/json
 * @consumes application/json
 */
router.post('/register', async (req, res) => {
    try {
        const { error } = validate(req.body);
        if (error) {
            let result = response.unProcessable(error.details[0].message);
            return res.status(result.code).send(result);
        }

        let user = await User.findOne({ email: req.body.email })
        if (user) {
            let result = response.unProcessable('User with this email already register.');
            return res.status(result.code).send(result);
        }

        user = new User({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            createdAt: new Date()
        });

        user.password = await user.generateHash(user.password);
        await user.save();
        const token = await user.generateAuthToken(user);
        res.header('authorization', token);
        let result = response.success("Registration success", user);
        return res.status(result.code).send(result);
    }
    catch (ex) {
        let result = response.fail(ex.message);
        return res.status(result.code).send(result);
    }
})

/**
 * @typedef Login
 * @property {string} email.required
 * @property {string} password.required
 */
/**
 * @route POST /user/login
 * @group Authentication
 * @param {Login.model} Login.body.required - login model required
 * @returns {Response.model} 200 - User info
 * @returns {Error.model} Default - Unexpected error
 * @produces application/json
 * @consumes application/json
 */
router.post('/login', async (req, res) => {
    try {
        const { error } = validateReq(req.body);
        if (error) {
            let result = response.unProcessable(error.details[0].message);
            return res.status(result.code).send(result);
        }

        let user = await User.findOne({ email: req.body.email })
        if (!user) {
            let result = response.unProcessable('Invalid email or password.');
            return res.status(result.code).send(result);
        }

        const validatePassword = await bcrypt.compare(req.body.password, user.password);
        if (!validatePassword) {
            let result = response.unProcessable('Invalid email or password.');
            return res.status(result.code).send(result);
        }

        const token = await user.generateAuthToken(user);
        res.header('authorization', token);
        let result = response.success("login success", user);
        return res.status(result.code).send(result);
    }
    catch (ex) {
        let result = response.fail(ex.message);
        return res.status(result.code).send(result);
    }
})

/**
 * @typedef ProfileUpdate
 * @property {string} name.required
 * @property {string} email.required
 */
/**
 * @route PUT /user/{id}
 * @group User
 * @param {ProfileUpdate.model} ProfileUpdate.body.required - profile update model required
 * @param {ParamsUserId.model} id.path.required
 * @param {Security.model} Authorization.header.required
 * @returns {Response.model} 200 - User info
 * @returns {Error.model} 500 - Internal server error
 * @returns {Error.model} Default - Unexpected error
 * @produces application/json
 * @consumes application/json
 */
router.put('/:id', auth, async (req, res) => {
    try {

        let checkUser = await User.findOne({ _id: req.params.id })
        if (!checkUser) {
            let result = response.unProcessable('Account not found');
            return res.status(result.code).send(result);
        }

        let user = await User.findOne({ $and: [{ email: req.body.email }, { _id: { $ne: req.params.id } }] })
        if (user) {
            let result = response.unProcessable('Email already exists.');
            return res.status(result.code).send(result);
        }

        let updateUser = await User.findOneAndUpdate({ _id: req.params.id }, { $set: req.body }, { new: true })

        let result = response.success("Profile updated", updateUser);
        return res.status(result.code).send(result);
    }
    catch (ex) {
        let result = response.fail(ex.message);
        return res.status(result.code).send(result);
    }
})

/**
 * @typedef UpdatePassword
 * @property {string} currentpassword.required
 * @property {string} newpassword.required
 */
/**
 * @route POST /user/update-password
 * @group User
 * @param {UpdatePassword.model} UpdatePassword.body.required - profile update model required
 * @param {Security.model} Authorization.header.required
 * @returns {Response.model} 200 - User info
 * @returns {Error.model} 500 - Internal server error
 * @returns {Error.model} Default - Unexpected error
 * @produces application/json
 * @consumes application/json
 */
router.post('/update-password', auth, async (req, res) => {
    try {

        let user = await User.findOne({ _id: req.user._id })
        if (!user) {
            let result = response.unProcessable('Account not found');
            return res.status(result.code).send(result);
        }

        if (!bcrypt.compareSync(req.body.currentpassword, user.password)) {
            let result = response.unProcessable('Incorrect current password');
            return res.status(result.code).send(result);
        }
        user.password = await user.generateHash(req.body.newpassword);

        let updateUser = await User.findOneAndUpdate({ _id: req.user._id }, { $set: { password: user.password } }, { new: true })

        let result = response.success("Password updated", updateUser);
        return res.status(result.code).send(result);
    }
    catch (ex) {
        let result = response.fail(ex.message);
        return res.status(result.code).send(result);
    }
})

/**
 * @route POST /user/deactivate
 * @group User
 * @param {Security.model} Authorization.header.required
 * @returns {Response.model} 200 - User info
 * @returns {Error.model} 500 - Internal server error
 * @returns {Error.model} Default - Unexpected error
 * @produces application/json
 * @consumes application/json
 */
router.post('/deactivate', auth, async (req, res) => {
    try {

        let user = await User.findOne({ _id: req.user._id })
        if (!user) {
            let result = response.unProcessable('Account not found');
            return res.status(result.code).send(result);
        }

        let businessId = user.businessId;

        let deleteCustomers = await Customer.deleteMany({ businessId: businessId });
        let deleteStaffs = await Staff.deleteMany({ businessId: businessId });
        let deleteServices = await Service.deleteMany({ businessId: businessId });
        let deleteAppointments = await Appointment.deleteMany({ businessId: businessId });
        let deleteAccount = await User.deleteOne({ _id: req.user._id });

        let result = response.success("Appointment deactivated", deleteAccount);
        return res.status(result.code).send(result);
    }
    catch (ex) {
        let result = response.fail(ex.message);
        return res.status(result.code).send(result);
    }
})

function validateReq(req) {
    const schema = Joi.object({
        email: Joi.string().required().email(),
        password: Joi.string().required(),
    })
    return schema.validate(req);
}

module.exports = router;