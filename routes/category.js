const auth = require('../middleware/auth');
const { validate, Category } = require('../models/category');
const response = require('../response_model/response');
const { Service } = require('../models/service');
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const _ = require('lodash')
const Joi = require('joi')
Joi.objectId = require('joi-objectid')(Joi)


router.post('/', auth, async (req, res) => {
   try {

      let category = await Category.findOne({ $and: [{ name: req.body.name }, { type: req.body.type }, { businessId: req.user.businessId }] })
      if (category) {
         let result = response.unProcessable('Category already exists.');
         return res.status(result.code).send(result);
      }

      req.body.createdAt = new Date()
      req.body.businessId = req.user.businessId;
      category = new Category(req.body);

      let addCategory = await category.save();
      let result = response.success("Category created", addCategory);
      return res.status(result.code).send(result);
   }
   catch (ex) {
      let result = response.fail(ex.message);
      return res.status(result.code).send(result);
   }
})

router.post('/catlist-count', auth, async (req, res) => {
   try {

      let businessId = req.user.businessId;
      let limit = (req.body.limit != '' && req.body.limit != undefined) ? parseInt(req.body.limit) : 10;
      let pageNo = (req.body.pageNo != '' && req.body.pageNo != undefined) ? parseInt(req.body.pageNo) : 1;
      let skip = (pageNo - 1) * limit;

      let queryArr = [
         { $match: { $and: [{ type: req.body.type }, { businessId: businessId }] } },
         { $lookup: { from: 'services', localField: '_id', foreignField: 'categories', as: 'services' } },
         { $project: { '_id': 1, name: 1, ServiceCount: { $size: '$services' } } },
         {
            $facet: {
               paginatedResults: [{ $skip: skip }, { $limit: limit }],
               totalCount: [
                  {
                     $count: 'count'
                  }
               ]
            }
         }
      ]

      let categories = await Category.aggregate(queryArr);

      var totalPages = Math.ceil((categories[0].totalCount[0].count) / limit);
      res.send({ categoryList: categories[0].paginatedResults, totalCategory: categories[0].totalCount[0].count, totalPages: totalPages })
   }
   catch (ex) {
      let result = response.fail(ex.message);
      return res.status(result.code).send(result);
   }
})

router.delete('/:id', auth, async (req, res) => {
   try {

      let checkCategory = await Category.findOne({ _id: req.params.id })
      if (!checkCategory) {
         let result = response.unProcessable('Category not found');
         return res.status(result.code).send(result);
      }

      let updateServices = await Service.updateMany({ $pull: { categories: req.params.id } });

      let deleteCategory = await Category.deleteOne({ _id: req.params.id });

      let result = response.success("Category deleted", deleteCategory);
      return res.status(result.code).send(result);
   }
   catch (ex) {
      let result = response.fail(ex.message);
      return res.status(result.code).send(result);
   }
})

router.put('/:id', auth, async (req, res) => {
   try {

      let checkCategory = await Category.findOne({ _id: req.params.id })
      if (!checkCategory) {
         let result = response.unProcessable('Category not found');
         return res.status(result.code).send(result);
      }

      let updateCategory = await Category.findOneAndUpdate({ _id: req.params.id }, { $set: req.body }, { new: true })

      let result = response.success("Category updated", updateCategory);
      return res.status(result.code).send(result);
   }
   catch (ex) {
      let result = response.fail(ex.message);
      return res.status(result.code).send(result);
   }
})

// get service list by category id
router.get('/service-list/:id', auth, async (req, res) => {
   try {

      let queryArr = [
         { $match: { _id: mongoose.Types.ObjectId(req.params.id) } },
         { $lookup: { from: 'services', localField: '_id', foreignField: 'categories', as: 'servicesList' } }
      ]

      let categories = await Category.aggregate(queryArr);

      let result = response.success("Service list", categories);
      return res.status(result.code).send(result);
   }
   catch (ex) {
      let result = response.fail(ex.message);
      return res.status(result.code).send(result);
   }
})

module.exports = router;