const auth = require('../middleware/auth');
const fileupload = require('../service/fileupload');
const response = require('../response_model/response');
const express = require('express');
const router = express.Router();
const _ = require('lodash');
const mongoose = require('mongoose');
const moment = require('moment-timezone');
const { Appointment } = require('../models/appointment');
const { Setting } = require('../models/setting');

router.get('/week-sheducle', auth, async (req, res) => {
   try {

      let limit = req.query.limit ? req.query.limit : 10;
      let page = req.query.page ? req.query.page : 1;

      let setting = await Setting.findOne({ businessId: req.user.businessId });
      let weekDay = setting.weekStartDay;
      let startOfWeek = moment().startOf('isoWeek').isoWeekday(weekDay).format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
      let endOfWeek = moment(startOfWeek).add(6, 'd').endOf('day').format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");

      let query = { $and: [{ businessId: mongoose.Types.ObjectId(req.user.businessId) }, { startDateTime: { $gte: new Date(startOfWeek) } }, { endDateTime: { $lte: new Date(endOfWeek) } }] };
      let options = {
         sort: { createdAt: -1 },
         populate: [{ path: 'staffId', select: '_id name email' }, { path: 'serviceId', select: '_id name cost time' }, { path: 'customerId', select: '' }],
         page: page,
         limit: limit
      };

      var getAppointment = await Appointment.paginate(query, options);
      let result = response.success("Appointment list", getAppointment);
      return res.status(result.code).send(result);
   }
   catch (ex) {
      let result = response.fail(ex.message);
      return res.status(result.code).send(result);
   }
})

router.get('/statistics', auth, async (req, res) => {
   try {

      let setting = await Setting.findOne({ businessId: req.user.businessId });
      let weekDay = setting.weekStartDay;
      let startOfWeek = moment().startOf('isoWeek').isoWeekday(weekDay).format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
      let endOfWeek = moment(startOfWeek).add(6, 'd').endOf('day').format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
      let start = moment().startOf('isoWeek').isoWeekday(weekDay).format("ll");
      let end = moment(startOfWeek).add(6, 'd').endOf('day').format("ll");
      let today = new Date();

      let thisweek = { start, end };
      let ConfirmedRevenue = [];
      let ProjectedRevenue = [];

      let query = { $and: [{ businessId: mongoose.Types.ObjectId(req.user.businessId) }, { startDateTime: { $gte: new Date(startOfWeek) } }, { endDateTime: { $lte: new Date(endOfWeek) } }] };
      let options = {
         sort: { createdAt: -1 },
         populate: [{ path: 'staffId', select: '_id name email' }, { path: 'serviceId', select: '_id name cost time' }, { path: 'customerId', select: '' }]
      };

      let getAppointment = await Appointment.paginate(query, options);
      let totalAppointment = getAppointment.totalDocs;
      for (let i = 0; i < getAppointment.docs.length; i++) {
         const appointment = getAppointment.docs[i];
         if (moment(appointment.startDateTime).isBefore(today)) {
            ConfirmedRevenue.push(appointment.cost);
         }
         else {
            ProjectedRevenue.push(appointment.cost);
         }
      }

      let statistics = {
         thisweek: thisweek,
         appointments: totalAppointment,
         ConfirmedRevenue: _.sum(ConfirmedRevenue),
         ProjectedRevenue: _.sum(ProjectedRevenue)
      }

      let result = response.success("This week statistics", statistics);
      return res.status(result.code).send(result);
   }
   catch (ex) {
      let result = response.fail(ex.message);
      return res.status(result.code).send(result);
   }
})

router.get('/week-activity', auth, async (req, res) => {
   try {

      let limit = req.query.limit ? req.query.limit : 10;
      let page = req.query.page ? req.query.page : 1;

      let setting = await Setting.findOne({ businessId: req.user.businessId });
      let weekDay = setting.weekStartDay;
      let startOfWeek = moment().startOf('isoWeek').isoWeekday(weekDay).format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
      let endOfWeek = moment(startOfWeek).add(6, 'd').endOf('day').format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");

      let query = { $and: [{ businessId: mongoose.Types.ObjectId(req.user.businessId) }, { startDateTime: { $gte: new Date(startOfWeek) } }, { endDateTime: { $lte: new Date(endOfWeek) } }] };
      let options = {
         sort: { createdAt: -1 },
         populate: [{ path: 'staffId', select: '_id name email' }, { path: 'serviceId', select: '_id name cost time' }, { path: 'customerId', select: '' }],
         page: page,
         limit: limit
      };

      var getAppointment = await Appointment.paginate(query, options);
      let result = response.success("Appointment list", getAppointment);
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