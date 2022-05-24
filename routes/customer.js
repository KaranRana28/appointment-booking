const auth = require('../middleware/auth');
const fileupload = require('../service/fileupload');
const { validate, Customer } = require('../models/customer');
const response = require('../response_model/response');
const express = require('express');
const router = express.Router();
const _ = require('lodash');
const mongoose = require('mongoose');
const moment = require('moment-timezone');
const { Service } = require('../models/service');
const { Appointment } = require('../models/appointment');
const { Business } = require('../models/business');
const { Staff } = require('../models/staff');

/**
 * @typedef Response
 * @property {integer} code.required
 * @property {boolean} success.required
 * @property {string} message.required
 * @property {object} data.required
 */

/**
 * @typedef Error
 * @property {integer} code.required
 * @property {boolean} success.required
 * @property {string} message.required
 * @property {string} error.required
 */

/**
 * @typedef Security
 * @property {string} Authorization.required
 */

/**
 * @typedef ParamsUserId
 * @property {string} id.required
 */

/**
 * @typedef NewCustomer
 * @property {string} name.required
 * @property {string} email.required
 * @property {string} countryCode
 * @property {string} mobile
 */
/**
 * @route POST /customer
 * @group Customer
 * @param {NewCustomer.model} NewCustomer.body.required - register model required
 * @param {Security.model} Authorization.header.required
 * @returns {Response.model} 200 - User info
 * @returns {Error.model} Default - Unexpected error
 * @produces application/json
 * @consumes application/json
 */
router.post('/', auth, async (req, res) => {
   try {
      const { error } = validate(req.body);
      if (error) {
         let result = response.unProcessable(error.details[0].message);
         return res.status(result.code).send(result);
      }

      let customer = await Customer.findOne({ $and: [{ email: req.body.email }, { businessId: req.user.businessId }] })
      if (customer) {
         let result = response.unProcessable('Customer with this email already register.');
         return res.status(result.code).send(result);
      }

      req.body.createdAt = new Date()
      req.body.businessId = req.user.businessId;
      customer = new Customer(req.body);

      let addCustomer = await customer.save();
      let result = response.success("Customer created", addCustomer);
      res.status(result.code).send(result);
   }
   catch (ex) {
      let result = response.fail(ex.message);
      return res.status(result.code).send(result);
   }
})

/**
 * @route GET /customer
 * @group Customer
 * @param {string} page.query.required - page no
 * @param {string} limit.query.required - limit of result
 * @param {string} search.query - search result
 * @param {Security.model} Authorization.header.required
 * @returns {Response.model} 200 - User info
 * @returns {Error.model} Default - Unexpected error
 * @produces application/json
 * @consumes application/json
 */
router.get('/', auth, async (req, res) => {
   try {
      console.log(req.query);
      let limit = req.query.limit ? req.query.limit : 10;
      let page = req.query.page ? req.query.page : 1;
      let query = {
         $or: [
            { name: { $regex: req.query.search, $options: 'i' } },
            { email: { $regex: req.query.search, $options: 'i' } }
         ]
      }

      let options = {
         sort: { createdAt: -1 },
         page: page,
         limit: limit
      };

      var customers = await Customer.paginate(query, options);
      let result = response.success("Customer list", customers);
      return res.status(result.code).send(result);
   }
   catch (ex) {
      let result = response.fail(ex.message);
      return res.status(result.code).send(result);
   }
})

router.delete('/:id', auth, async (req, res) => {
   try {

      let checkCustomer = await Customer.findOne({ _id: req.params.id })
      if (!checkCustomer) {
         let result = response.unProcessable('Customer not found');
         return res.status(result.code).send(result);
      }

      photoUrl = checkCustomer.photo;
      let deleteCustomer = await Customer.deleteOne({ _id: req.params.id });
      if (deleteCustomer && photoUrl != "" && photoUrl != undefined) {
         await fileupload.deletefile(photoUrl)
      }

      let result = response.success("Customer deleted", deleteCustomer);
      return res.status(result.code).send(result);
   }
   catch (ex) {
      let result = response.fail(ex.message);
      return res.status(result.code).send(result);
   }
})

router.post('/note', auth, async (req, res) => {
   try {

      let checkCustomer = await Customer.findOne({ _id: req.body.customerId })
      if (!checkCustomer) {
         let result = response.unProcessable('Customer not found');
         return res.status(result.code).send(result);
      }

      let addNote = await Customer.findOneAndUpdate({ _id: req.body.customerId }, { $set: { note: req.body.note } }, { new: true })

      let result = response.success("Customer note updated.", addNote);
      return res.status(result.code).send(result);
   }
   catch (ex) {
      let result = response.fail(ex.message);
      return res.status(result.code).send(result);
   }
})

router.put('/:id', [auth, fileupload.uploadfile], async (req, res) => {
   try {

      let checkCustomer = await Customer.findOne({ _id: req.params.id })
      if (!checkCustomer) {
         let result = response.unProcessable('Customer not found');
         return res.status(result.code).send(result);
      }

      let customer = await Customer.findOne({ $and: [{ email: req.body.email }, { businessId: req.user.businessId }, { _id: { $ne: req.params.id } }] })
      if (customer) {
         let result = response.unProcessable('Customer with this email already register');
         return res.status(result.code).send(result);
      }

      let photoUrl = checkCustomer.photo;
      req.body.updatedAt = new Date()

      let updateCustomer = await Customer.findOneAndUpdate({ _id: req.params.id }, { $set: req.body }, { new: true })
      if (updateCustomer && updateCustomer.photo != photoUrl && photoUrl != "" && photoUrl != undefined) {
         await fileupload.deletefile(photoUrl)
      }

      let result = response.success("Customer updated.", updateCustomer);
      return res.status(result.code).send(result);
   }
   catch (ex) {
      let result = response.fail(ex.message);
      return res.status(result.code).send(result);
   }
})

router.put('/remove-image/:id', auth, async (req, res) => {
   try {

      let checkCustomer = await Customer.findOne({ _id: req.params.id })
      if (!checkCustomer) {
         let result = response.unProcessable('Customer not found');
         return res.status(result.code).send(result);
      }

      let customerImage = checkCustomer.photo;
      if (customerImage == "" && customerImage == undefined) return res.status(400).send("Image not found")
      let deletefile = await fileupload.deletefile(customerImage);

      if (!deletefile) return res.status(500).send("Something went wrong");
      let updateCustomer = await Customer.findOneAndUpdate({ _id: req.params.id }, { $set: { photo: "" } }, { new: true })

      let result = response.success("Customer updated.", updateCustomer);
      return res.status(result.code).send(result);
   }
   catch (ex) {
      let result = response.fail(ex.message);
      return res.status(result.code).send(result);
   }
})

router.get('/appointments', auth, async (req, res) => {
   try {

      let limit = req.query.limit ? req.query.limit : 10;
      let page = req.query.page ? req.query.page : 1;
      let business = await Business.findOne({ _id: req.user.businessId });
      let timeZone = business.businessTimeZone;

      let query = { customerId: req.query.customerId }
      let options = {
         sort: { createdAt: -1 },
         populate: [{ path: 'staffId', select: '_id name email' }, { path: 'serviceId', select: '_id name cost time' }, { path: 'customerId', select: '' }],
         page: page,
         limit: limit,
         lean:  true
      };
      
      var appointments = await Appointment.paginate(query, options);
      let results = [];

      for (let i = 0; i < appointments.docs.length; i++) {
         const appointment = appointments.docs[i];
         appointment.scheduleDate = moment(appointment.startDateTime).tz(timeZone).format('llll');
         appointment.scheduleTime = moment(appointment.startDateTime).tz(timeZone).format('h:mm A') + " - " + moment(appointment.endDateTime).tz(timeZone).format('h:mm A');
         results.push(appointment);
      }

      appointments.docs = results;
      let result = response.success("Customer appointment list.", appointments);
      return res.status(result.code).send(result);
   }
   catch (ex) {
      let result = response.fail(ex.message);
      return res.status(result.code).send(result);
   }
})

module.exports = router;