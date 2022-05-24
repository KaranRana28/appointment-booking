const auth = require('../middleware/auth');
const fileupload = require('../service/fileupload');
const { validate, Staff } = require('../models/staff');
const response = require('../response_model/response');
const { Business } = require('../models/business');
const express = require('express');
const router = express.Router();
const _ = require('lodash');

router.post('/', auth, async (req, res) => {
   try {
      const { error } = validate(req.body);
      if (error) {
         let result = response.unProcessable(error.details[0].message);
         return res.status(result.code).send(result);
      }

      if (req.body.email) {
         let staff = await Staff.findOne({ $and: [{ email: req.body.email }, { businessId: req.user.businessId }] })
         if (staff) {
            let result = response.unProcessable('Staff with this email already register.');
            return res.status(result.code).send(result);
         }
      }

      let business = await Business.findOne({ _id: req.user.businessId });

      req.body.createdAt = new Date()
      req.body.businessId = req.user.businessId;
      req.body.businessHours = business.businessHours;
      staff = new Staff(req.body);

      let addStaff = await staff.save();
      let result = response.success("Staff created", addStaff);
      return res.status(result.code).send(result);
   }
   catch (ex) {
      let result = response.fail(ex.message);
      return res.status(result.code).send(result);
   }
})

router.get('/:id', auth, async (req, res) => {
   try {

      let checkStaff = await Staff.findOne({ _id: req.params.id }).populate('services', '_id name cost time');
      if (!checkStaff) {
         let result = response.unProcessable('Staff not found');
         return res.status(result.code).send(result);
      }

      let result = response.success("Staff details", checkStaff);
      return res.status(result.code).send(result);
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

      let query = {
         $or: [
            { name: { $regex: req.query.search, $options: 'i' } },
            { email: { $regex: req.query.search, $options: 'i' } }
         ]
      };

      let options = {
         sort: { createdAt: -1 },
         page: page,
         limit: limit
      };

      var getStaff = await Staff.paginate(query, options);
      let result = response.success("Staff list", getStaff);
      return res.status(result.code).send(result);
   }
   catch (ex) {
      let result = response.fail(ex.message);
      return res.status(result.code).send(result);
   }
})

router.put('/:id', [auth, fileupload.uploadfile], async (req, res) => {
   try {

      let checkStaff = await Staff.findOne({ _id: req.params.id })
      if (!checkStaff) {
         let result = response.unProcessable('Staff not found');
         return res.status(result.code).send(result);
      }

      let staff = await Staff.findOne({ $and: [{ email: req.body.email }, { businessId: req.user.businessId }, { _id: { $ne: req.params.id } }] })
      if (staff) {
         let result = response.unProcessable('Staff with this email already register.');
         return res.status(result.code).send(result);
      }

      let photoUrl = checkStaff.photo;
      req.body.updatedAt = new Date()

      let updateStaff = await Staff.findOneAndUpdate({ _id: req.params.id }, { $set: req.body }, { new: true });
      if (updateStaff && updateStaff.photo != photoUrl && photoUrl != "" && photoUrl != undefined) {
         await fileupload.deletefile(photoUrl)
      }

      let result = response.success("Staff updated", updateStaff);
      return res.status(result.code).send(result);
   }
   catch (ex) {
      let result = response.fail(ex.message);
      return res.status(result.code).send(result);
   }
})

router.put('/remove-image/:id', auth, async (req, res) => {
   try {

      let checkStaff = await Staff.findOne({ _id: req.params.id })
      if (!checkStaff) {
         let result = response.unProcessable('Staff not found');
         return res.status(result.code).send(result);
      }

      let staffImage = checkStaff.photo;
      if (staffImage == "" && staffImage == undefined) {
         let result = response.unProcessable('Image not found');
         return res.status(result.code).send(result);
      }
      let deletefile = await fileupload.deletefile(staffImage);

      if (!deletefile) {
         let result = response.fail('Something went wrong');
         return res.status(result.code).send(result);
      }
      let updateStaff = await Staff.findOneAndUpdate({ _id: req.params.id }, { $set: { photo: "" } }, { new: true })

      let result = response.success("Image removed", updateStaff);
      return res.status(result.code).send(result);
   }
   catch (ex) {
      let result = response.fail(ex.message);
      return res.status(result.code).send(result);
   }
})

router.delete('/:id', auth, async (req, res) => {
   try {

      let checkStaff = await Staff.findOne({ _id: req.params.id })
      if (!checkStaff) {
         let result = response.unProcessable('Staff not found');
         return res.status(result.code).send(result);
      }

      photoUrl = checkStaff.photo;
      let deleteStaff = await Staff.deleteOne({ _id: req.params.id });
      if (deleteStaff && photoUrl != "" && photoUrl != undefined) {
         await fileupload.deletefile(photoUrl)
      }

      let result = response.success("Staff deleted", deleteStaff);
      return res.status(result.code).send(result);
   }
   catch (ex) {
      let result = response.fail(ex.message);
      return res.status(result.code).send(result);
   }
})

router.post('/assign-service', auth, async (req, res) => {
   try {

      let checkStaff = await Staff.findOne({ _id: req.body.staffId })
      if (!checkStaff) {
         let result = response.unProcessable('Staff not found');
         return res.status(result.code).send(result);
      }

      let services = checkStaff.services;
      let filterServices = _.uniq(req.body.services);
      let newServices = _.difference(filterServices, services);

      let updateStaff = await Staff.findOneAndUpdate({ _id: req.body.staffId }, { $set: { services: newServices } }, { new: true });

      let result = response.success("Staff assigned service successfully", updateStaff);
      return res.status(result.code).send(result);
   }
   catch (ex) {
      let result = response.fail(ex.message);
      return res.status(result.code).send(result);
   }
})

router.put('/business-hours/:id', auth, async (req, res) => {
   try {

      let checkStaff = await Staff.findOne({ _id: req.params.id })
      if (!checkStaff) {
         let result = response.unProcessable('Staff not found');
         return res.status(result.code).send(result);
      }

      let updateStaff = await Staff.findOneAndUpdate({ _id: req.params.id }, { $set: { businessHours: req.body.businessHours } }, { new: true });

      let result = response.success("Staff business-hour updated", updateStaff);
      return res.status(result.code).send(result);
   }
   catch (ex) {
      let result = response.fail(ex.message);
      return res.status(result.code).send(result);
   }
})

router.post('/break', auth, async (req, res) => {
   try {

      let checkStaff = await Staff.findOne({ _id: req.body.staffId });
      if (!checkStaff) {
         let result = response.unProcessable('Staff not found');
         return res.status(result.code).send(result);
      }

      let businessHours = checkStaff.businessHours;
      let weekday = req.body.weekday;
      let breakTime = req.body.breaktime;
      let day = _.find(businessHours, ['weekday', weekday]);
      if (!day.isOpen) {
         let result = response.unProcessable('Its a Day off');
         return res.status(result.code).send(result);
      }

      if (day.breaktime) {

         // check break overlap
         let updateStaff = await Staff.findOneAndUpdate({ _id: req.body.staffId, "businessHours.weekday": weekday }, { $push: { 'businessHours.$.breaktime': breakTime } }, { new: true });
         let result = response.success("Break added", updateStaff);
         return res.status(result.code).send(result);
      }
      else {
         day.breaktime = [breakTime];
         let updateStaff = await Staff.findOneAndUpdate({ _id: req.body.staffId, "businessHours.weekday": weekday }, { $set: { 'businessHours.$': day } }, { new: true });
         let result = response.success("Break added", updateStaff);
         return res.status(result.code).send(result);
      }
   }
   catch (ex) {
      let result = response.fail(ex.message);
      return res.status(result.code).send(result);
   }
})

module.exports = router;