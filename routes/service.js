const auth = require('../middleware/auth');
const fileupload = require('../service/fileupload');
const { validate, Service } = require('../models/service');
const response = require('../response_model/response');
const { Staff } = require('../models/staff');
const express = require('express');
const router = express.Router();
const _ = require('lodash')

router.post('/', [auth, fileupload.uploadfile], async (req, res) => {
   try {
      const { error } = validate(req.body);
      if (error) {
         let result = response.unProcessable(error.details[0].message);
         return res.status(result.code).send(result);
      }

      req.body.createdAt = new Date()
      req.body.businessId = req.user.businessId;
      service = new Service(req.body);

      let addService = await service.save();

      if (addService && addService.staffs.length > 0) {
         let updateStaff = await Staff.updateMany({ _id: { $in: addService.staffs } }, { $push: { services: addService._id } });
      }

      let result = response.success("Service created", addService);
      return res.status(result.code).send(result);
   }
   catch (ex) {
      let filepath = req.body.photo;
      if (filepath != "" && filepath != undefined) { await fileupload.deletefile(filepath) }
      let result = response.fail(ex.message);
      return res.status(result.code).send(result);
   }
})

router.put('/:id', [auth, fileupload.uploadfile], async (req, res) => {
   try {
      const { error } = validate(req.body);
      if (error) {
         let result = response.unProcessable(error.details[0].message);
         return res.status(result.code).send(result);
      }

      let checkService = await Service.findOne({ _id: req.params.id })
      if (!checkService) {
         let result = response.unProcessable('Service not found');
         return res.status(result.code).send(result);
      }

      let photoUrl = checkService.photo;
      let staffs = checkService.staffs;
      let categories = checkService.categories;
      let newStaffs = _.difference(req.body.staffs, staffs);
      let newCategories = _.difference(req.body.categories, categories);
      let removedStaffs = [];
      let addedStaffs = [];

      _.forEach(staffs, function (staff) {
         let test = _.some(newStaffs, e => e == staff);
         if (!test)
            removedStaffs.push(staff);
      });

      _.forEach(newStaffs, function (staff) {
         let test = _.some(staffs, e => e == staff);
         if (!test)
            addedStaffs.push(staff);
      });

      let removeStaff = await Staff.updateMany({ _id: { $in: removedStaffs } }, { $pull: { services: req.params.id } });
      let addStaff = await Staff.updateMany({ _id: { $in: addedStaffs } }, { $push: { services: req.params.id } });

      req.body.staffs = newStaffs;
      req.body.categories = newCategories;
      req.body.updatedAt = new Date();
      let updateService = await Service.findOneAndUpdate({ _id: req.params.id }, { $set: req.body }, { new: true })
      if (updateService && updateService.photo != photoUrl && photoUrl != "" && photoUrl != undefined) {
         await fileupload.deletefile(photoUrl)
      }

      let result = response.success("Service updated", updateService);
      return res.status(result.code).send(result);
   }
   catch (ex) {
      let result = response.fail(ex.message);
      return res.status(result.code).send(result);
   }
})

router.delete('/:id', auth, async (req, res) => {
   try {

      let checkService = await Service.findOne({ _id: req.params.id })
      if (!checkService) {
         let result = response.unProcessable('Service not found');
         return res.status(result.code).send(result);
      }

      let photoUrl = checkService.photo;
      let staffs = checkService.staffs;

      let deleteService = await Service.deleteOne({ _id: req.params.id });
      let updateStaff = await Staff.updateMany({ _id: { $in: staffs } }, { $pull: { services: checkService._id } });
      if (deleteService && photoUrl != "" && photoUrl != undefined) {
         await fileupload.deletefile(photoUrl)
      }

      let result = response.success("Service deleted", deleteService);
      return res.status(result.code).send(result);
   }
   catch (ex) {
      let result = response.fail(ex.message);
      return res.status(result.code).send(result);
   }
})

router.put('/remove-image/:id', auth, async (req, res) => {
   try {

      let checkService = await Service.findOne({ _id: req.params.id })
      if (!checkService) {
         let result = response.unProcessable('Service not found');
         return res.status(result.code).send(result);
      }

      let serviceImage = checkService.photo;
      if (serviceImage == "" && serviceImage == undefined) {
         let result = response.unProcessable('Image not found');
         return res.status(result.code).send(result);
      }
      let deletefile = await fileupload.deletefile(serviceImage);

      if (!deletefile) return res.status(500).send("Something went wrong");
      let updateService = await Service.findOneAndUpdate({ _id: req.params.id }, { $set: { photo: "" } }, { new: true })

      let result = response.success("Service updated", updateService);
      return res.status(result.code).send(result);
   }
   catch (ex) {
      let result = response.fail(ex.message);
      return res.status(result.code).send(result);
   }
})

router.get('/:id', auth, async (req, res) => {
   try {

      let checkService = await Service.findOne({ _id: req.params.id }).populate('categories staffs', '_id name _id name');
      if (!checkService) {
         let result = response.unProcessable('Service not found');
         return res.status(result.code).send(result);
      }

      let result = response.success("Service detail", checkService);
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
            { description: { $regex: req.query.search, $options: 'i' } }
         ]
      }

      let options = {
         select: 'name time cost description photo',
         sort: { createdAt: -1 },
         page: page,
         limit: limit
      };

      var services = await Service.paginate(query, options);
      let result = response.success("Service list", services);
      return res.status(result.code).send(result);
   }
   catch (ex) {
      let result = response.fail(ex.message);
      return res.status(result.code).send(result);
   }
})

module.exports = router;