const mongoose = require('mongoose')
const Joi = require('joi')
Joi.objectId = require('joi-objectid')(Joi)
const mongoosePaginate = require('mongoose-paginate-v2');
const aggregatePaginate = require('mongoose-aggregate-paginate-v2');

const staffSchema = new mongoose.Schema({
   name: { type: String, required: true },
   email: { type: String },
   description: { type: String },
   businessId: { type: mongoose.Types.ObjectId, ref: 'Business' },
   photo: { type: String },
   countryCode: { type: String },
   mobile: { type: String },
   services: [{ type : mongoose.Types.ObjectId, ref: 'Service', default : [] }],
   businessHours : { type : Array, default : [] },
   createdAt: {
      type: Date,
      default: Date.now()
   },
   updatedAt: {
      type: Date,
      default: Date.now()
   }
})

function validateStaff(staff) {
   const schema = Joi.object({
       id: Joi.objectId(),
       name: Joi.string().min(2).max(50).required(),
       email: Joi.any()
   })
   return schema.validate(staff);
}

staffSchema.plugin(mongoosePaginate);
staffSchema.plugin(aggregatePaginate);
const Staff = mongoose.model('Staff', staffSchema);

exports.Staff = Staff;
exports.validate = validateStaff;