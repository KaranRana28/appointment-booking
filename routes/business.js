const auth = require('../middleware/auth');
const fileupload = require('../service/fileupload');
const { validate, Business } = require('../models/business');
const response = require('../response_model/response');
const { User } = require('../models/user');
const { Setting } = require('../models/setting');
const express = require('express');
const router = express.Router();
const _ = require('lodash')
const bcrypt = require('bcryptjs');
const config = require("config");
const Joi = require('joi')
Joi.objectId = require('joi-objectid')(Joi)

router.post('/', auth, async (req, res) => {
    try {
        const { error } = validate(req.body);
        if (error) {
            let result = response.unProcessable(error.details[0].message);
            return res.status(result.code).send(result);
        }

        let checkBusiness = await Business.findOne({ ownerId: req.user._id });
        if (checkBusiness) {
            let result = response.unProcessable("Business Already created.");
            return res.status(result.code).send(result);
        }

        req.body.createdAt = new Date()
        req.body.ownerId = req.user._id;
        business = new Business(req.body);

        let newBusiness = await business.save();
        let updateAccount = await User.findOneAndUpdate({ _id: req.user._id }, { $set: { businessId: newBusiness._id } });
        let param = { businessId: newBusiness._id, ownerId: req.user._id };
        setting = new Setting(param);
        let addSetting = await setting.save();

        let result = response.success("Business created", newBusiness);
        return res.status(result.code).send(result);
    }
    catch (ex) {
        let result = response.fail(ex.message);
        return res.status(result.code).send(result);
    }
})

router.put('/', [auth, fileupload.uploadfile], async (req, res) => {
    try {

        let checkBusiness = await Business.findOne({ _id: req.user.businessId });
        if (!checkBusiness) {
            let result = response.unProcessable("Business not found.");
            return res.status(result.code).send(result);
        }

        let business = await Business.findOne({ $and: [{ email: req.body.email }, { businessId: { $ne: req.user.businessId } }] });
        if (business) {
            let result = response.unProcessable("Email already register.");
            return res.status(result.code).send(result);
        }

        let photoUrl = checkBusiness.photo;
        req.body.updatedAt = new Date();

        let updateBusiness = await Business.findOneAndUpdate({ _id: req.user.businessId }, { $set: req.body }, { new: true });
        if (updateBusiness && updateBusiness.photo != photoUrl && photoUrl != "" && photoUrl != undefined) {
            await fileupload.deletefile(photoUrl)
        }

        let result = response.success("Business updated", updateBusiness);
        return res.status(result.code).send(result);
    }
    catch (ex) {
        let result = response.fail(ex.message);
        return res.status(result.code).send(result);
    }
})

router.put('/timezone', auth, async (req, res) => {
    try {

        let checkBusiness = await Business.findOne({ _id: req.user.businessId })
        if (!checkBusiness) {
            let result = response.unProcessable("Business not found");
            return res.status(result.code).send(result);
        }

        let updateTimeZone = await Business.findOneAndUpdate({ _id: req.user.businessId }, { $set: { businessTimeZone: req.body.timezone } }, { new: true });
        let result = response.success("Business timezone updated", updateTimeZone);
        return res.status(result.code).send(result);
    }
    catch (ex) {
        let result = response.fail(ex.message);
        return res.status(result.code).send(result);
    }
})

router.put('/business-hours', auth, async (req, res) => {
    try {

        let checkBusiness = await Business.findOne({ _id: req.user.businessId });
        if (!checkBusiness) {
            let result = response.unProcessable("Business not found");
            return res.status(result.code).send(result);
        }

        let updateHours = await Business.findOneAndUpdate({ _id: req.user.businessId }, { $set: { businessHours: req.body.businessHours } }, { new: true });
        let result = response.success("Business hours updated", updateHours);
        return res.status(result.code).send(result);
    }
    catch (ex) {
        let result = response.fail(ex.message);
        return res.status(result.code).send(result);
    }
})

module.exports = router;