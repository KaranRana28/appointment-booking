const auth = require('../middleware/auth');
const { validate, Appointment } = require('../models/appointment');
const response = require('../response_model/response');
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const _ = require('lodash');
const moment = require('moment-timezone');

router.post('/', auth, async (req, res) => {
   try {
      const { error } = validate(req.body);
      if (error) {
         let result = response.unProcessable(error.details[0].message);
         return res.status(result.code).send(result);
      }

      var query = {
         $or: [
            {
               startDateTime: {
                  $gte: req.body.startDateTime,
                  $lt: req.body.endDateTime
               }
            },
            {
               endDateTime: {
                  $gte: req.body.startDateTime,
                  $lt: req.body.endDateTime
               }
            }
         ]
      };

      let newQuery = {
         $or: [{ startDate: { $gte: req.body.from_date } }, { startDate: { $lte: req.body.to_date } }],
         $and: [
            {
               startDate: { $gte: req.body.from_date }
            },
            {
               endDateTime: { $lte: req.body.to_date }
            }
         ]
      }

      let newQueryx = {
         $or: [{
            $and: [
               {
                  startDate: { $gte: req.body.from_date }
               },
               {
                  endDateTime: { $lte: req.body.to_date }
               }
            ]
         }, { startDate: { $gte: req.body.from_date } }, { startDate: { $lte: req.body.to_date } }]
      }

      // > db.combinedAndOrDemo.find( {"$or":[ {"$and": [{"StudentFirstName": "John"}, {"_id": ObjectId("5cd306dcb64f4b851c3a13e2")}] }, {"StudentSkill" : "MongoDB" } ] } );




      let checkStaff = await Appointment.find({ $and: [{ staffId: req.body.staffId }, query] });
      if (checkStaff.length != 0) {
         let result = response.unProcessable("Staff is not available.");
         return res.status(result.code).send(result);
      }
      let checkCustomer = await Appointment.find({ $and: [{ customerId: req.body.customerId }, query] });
      if (checkCustomer.length != 0) {
         let result = response.unProcessable("Customer is busy.");
         return res.status(result.code).send(result);
      }

      req.body.createdAt = new Date()
      req.body.businessId = req.user.businessId;
      appoinment = new Appointment(req.body);

      let addAppoinment = await appoinment.save();
      let result = response.success("Appointment created", addAppoinment);
      return res.status(result.code).send(result);
   }
   catch (ex) {
      let result = response.fail(ex.message);
      return res.status(result.code).send(result);
   }
})

router.get('/:id', auth, async (req, res) => {
   try {

      let checkAppointment = await Appointment.findOne({ _id: req.params.id });
      if (!checkAppointment) {
         let result = response.unProcessable("Appointment not found");
         return res.status(result.code).send(result);
      }

      let populateQuery = [{ path: 'staffId', select: '_id name email' }, { path: 'serviceId', select: '_id name cost time' }, { path: 'customerId', select: '' }];
      let getAppointment = await Appointment.findOne({ _id: req.params.id }).populate(populateQuery);

      let result = response.success("Appointment details", getAppointment);
      return res.status(result.code).send(result);
   }
   catch (ex) {
      let result = response.fail(ex.message);
      return res.status(result.code).send(result);
   }
})

router.delete('/:id', auth, async (req, res) => {
   try {

      let checkAppointment = await Appointment.findOne({ _id: req.params.id })
      if (!checkAppointment) {
         let result = response.unProcessable("Appointment not found");
         return res.status(result.code).send(result);
      }

      let deleteAppointment = await Appointment.deleteOne({ _id: req.params.id });

      let result = response.success("Appointment deleted", deleteAppointment);
      return res.status(result.code).send(result);
   }
   catch (ex) {
      let result = response.fail(ex.message);
      return res.status(result.code).send(result);
   }
})

router.put('/:id', auth, async (req, res) => {
   try {
      const { error } = validate(req.body);
      if (error) {
         let result = response.unProcessable(error.details[0].message);
         return res.status(result.code).send(result);
      }

      let checkAppointment = await Appointment.findOne({ _id: req.params.id });
      if (!checkAppointment) {
         let result = response.unProcessable("Appointment not found");
         return res.status(result.code).send(result);
      }

      const query = {
         $or: [{
            startDateTime: {
               $gte: req.body.startDateTime,
               $lt: req.body.endDateTime
            }
         },
         {
            endDateTime: {
               $gte: req.body.startDateTime,
               $lt: req.body.endDateTime
            }
         }
         ]
      };

      if (moment(checkAppointment.startDateTime).isSame(req.body.startDateTime) && moment(checkAppointment.endDateTime).isSame(req.body.endDateTime)) {

         if (checkAppointment.staffId != req.body.staffId) {

            let checkStaff = await Appointment.find({ $and: [{ staffId: req.body.staffId }, query] });
            if (checkStaff.length != 0) {
               let result = response.unProcessable("Staff is not available.");
               return res.status(result.code).send(result);
            }
         }

         if (checkAppointment.customerId != req.body.customerId) {

            let checkCustomer = await Appointment.find({ $and: [{ customerId: req.body.customerId }, query] });
            if (checkCustomer.length != 0) {
               let result = response.unProcessable("Customer is busy.");
               return res.status(result.code).send(result);
            }
         }

         req.body.updatedAt = new Date();

         let updateAppointment = await Appointment.findOneAndUpdate({ _id: req.params.id }, { $set: req.body }, { new: true });
         let result = response.success("Appointment updated", updateAppointment);
         return res.status(result.code).send(result);

      }
      else {

         let checkStaff = await Appointment.find({ $and: [{ staffId: req.body.staffId }, query] });
         if (checkStaff.length != 0) {
            let result = response.unProcessable("Staff is not available.");
            return res.status(result.code).send(result);
         }

         let checkCustomer = await Appointment.find({ $and: [{ customerId: req.body.customerId }, query] });
         if (checkCustomer.length != 0) {
            let result = response.unProcessable("Customer is busy.");
            return res.status(result.code).send(result);
         }

         req.body.updatedAt = new Date();

         let updateAppointment = await Appointment.findOneAndUpdate({ _id: req.params.id }, { $set: req.body }, { new: true });
         let result = response.success("Appointment updated", updateAppointment);
         return res.status(result.code).send(result);

      }

   }
   catch (ex) {
      let result = response.fail(ex.message);
      return res.status(result.code).send(result);
   }
})

router.get('/', auth, async (req, res) => {
   try {

      let limit = req.query.limit ? req.query.limit : 10;
      let page = req.query.page ? req.query.page : 1;

      let query = {};
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


/// FILTERS QUERY
// query = {
//    $or: [{ // IN BETWEEN FILTER
//       $and: [
//          { startDate: { $gte: new Date(data.from_date) } },
//          { endDate: { $lte: new Date(data.to_date) } },
//       ]
//    },
//    { // 3 to 5 ---- 1 to 4 (get appointment based on end-time comes in between filter time(3-5) regard less of start-time)
//       $and: [
//          { startDate: { $lte: new Date(data.from_date) } },
//          { endDate: { $gte: new Date(data.from_date) } },
//       ]
//    },
//    { // 3 to 5 ---- 4 to 8 (get appointment based on start-time comes in between filter time(3-5) regard less of end-time)
//       $and: [
//          { startDate: { $lte: new Date(data.to_date) } },
//          { endDate: { $gte: new Date(data.to_date) } },
//       ]
//    }
//    ]
// }

module.exports = router;