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
const { Staff } = require('../models/staff');

// staff appointment filter day/week/month wise + staff statistic
router.post('/sheducles', auth, async (req, res) => {
   try {

      let checkStaff = await Staff.findOne({ _id: req.body.staffId });
      if (!checkStaff) {
         let result = response.unProcessable('Staff not found');
         return res.status(result.code).send(result);
      }

      let setting = await Setting.findOne({ businessId: req.user.businessId });
      let weekDay = setting.weekStartDay;
      let filterType = req.body.filterType;
      let date = req.body.date;
      let today = new Date();
      let ConfirmedRevenue = [];
      let ProjectedRevenue = [];

      if (filterType == 1) { // weekly filter
         var start = moment(date).startOf('isoWeek').isoWeekday(weekDay);
         var end = moment(start).add(6, 'd').endOf('day');

      }
      else if (filterType == 2) { // monthly filter
         var start = moment(date).startOf('month');
         var end = moment(start).endOf('month');
      }
      else { // 3 daily filter
         var start = moment(date).startOf('day');
         var end = moment(start).endOf('day');
      }

      let query = { $and: [{ staffId: mongoose.Types.ObjectId(req.body.staffId) }, { startDateTime: { $gte: new Date(start) } }, { endDateTime: { $lte: new Date(end) } }, { businessId: mongoose.Types.ObjectId(req.user.businessId) }] };
      let options = {
         sort: { createdAt: -1 },
         populate: [{ path: 'staffId', select: '_id name email' }, { path: 'serviceId', select: '_id name cost time' }, { path: 'customerId', select: '' }]
      };

      var getAppointment = await Appointment.paginate(query, options);
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

      getAppointment.appointments = totalAppointment;
      getAppointment.ConfirmedRevenue = _.sum(ConfirmedRevenue);
      getAppointment.ProjectedRevenue = _.sum(ProjectedRevenue);

      let result = response.success("Appointment list", getAppointment);
      return res.status(result.code).send(result);
   }
   catch (ex) {
      let result = response.fail(ex.message);
      return res.status(result.code).send(result);
   }
})

module.exports = router;