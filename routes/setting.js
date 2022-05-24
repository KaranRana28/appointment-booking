const auth = require('../middleware/auth');
const { validate, Setting } = require('../models/setting');
const response = require('../response_model/response');
const { User } = require('../models/user');
const express = require('express');
const router = express.Router();
const _ = require('lodash')

router.put('/accounts/preferences',auth, async (req, res) => {
   try {
      
      const { error } = validate(req.body);
      if (error) {
         let result = response.unProcessable(error.details[0].message);
         return res.status(result.code).send(result);
      }

      let checkSetting = await Setting.findOne({ businessId : req.user.businessId });
      if (!checkSetting){
         req.body.businessId = req.user.businessId;
         req.body.ownerId = req.user._id;
         req.body.createdAt = new Date()
         setting = new Setting(req.body);
         let addSetting = await setting.save();

         let result = response.success("Setting created", addSetting);
         return res.status(result.code).send(result);
      }
      else{
         req.body.updatedAt = new Date()
         let updateSetting = await Setting.findOneAndUpdate({ businessId : req.user.businessId }, { $set : req.body },{new : true});
         let result = response.success("Setting updated", updateSetting);
         return res.status(result.code).send(result);
      }
   }
   catch (ex) {
      let result = response.fail(ex.message);
      return res.status(result.code).send(result);
   }
})

module.exports = router;