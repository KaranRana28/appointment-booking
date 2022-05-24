const mongoose = require('mongoose');
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const mongoosePaginate = require('mongoose-paginate-v2');
const aggregatePaginate = require('mongoose-aggregate-paginate-v2');

const settingSchema = new mongoose.Schema({
   businessId: { type: mongoose.Types.ObjectId, ref: 'Business' },
   ownerId: { type: mongoose.Types.ObjectId, ref: 'User' },
   calenderView: { type: String, enum: ['Day', 'Week','Month'] , default : 'Week' },
   weekStartDay : { type : Number, default : 1 }, // 1 - monday
   customTimeSlot : { type : Number, default : 15 }, // calender view slots
   TimePickerSlot : { type : Number, default : 15 }, // time pick dropdown slot size
   calenderStartHour : { type : Number, default : 9 }, // calender start hour
   StartHourMeridian : { type : String, default : "am" }, // calender start hour meridian am/pm
   showCalenderStats : { type : Boolean, default : true }, // hide/show statistic of appointment in calender
   createdAt: {
      type: Date,
      default: Date.now()
   },
   updatedAt: {
      type: Date,
      default: Date.now()
   }
})

function validateSetting(setting) {
   const schema = Joi.object({
       id: Joi.objectId(),
       calenderView: Joi.string().required(),
       weekStartDay: Joi.number().required(),
       customTimeSlot: Joi.number().required(),
       TimePickerSlot: Joi.number().required(),
       calenderStartHour: Joi.number().required(),
       StartHourMeridian:  Joi.string().required(),
       showCalenderStats : Joi.boolean().required()
   })
   return schema.validate(setting);
}

settingSchema.plugin(mongoosePaginate);
settingSchema.plugin(aggregatePaginate);
const Setting = mongoose.model('Setting', settingSchema);

exports.Setting = Setting;
exports.validate = validateSetting;