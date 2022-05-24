const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const aggregatePaginate = require('mongoose-aggregate-paginate-v2');
const Joi = require('joi')
Joi.objectId = require('joi-objectid')(Joi)

const businessSchema = new mongoose.Schema({
   name: { type: String, required: true },
   countryCode: { type: String },
   mobile: { type: String },
   email: { type : String },
   address: { type: String },
   city : { type : String },
   state : { type : String },
   zip : { type : String },
   industry: { type: String },
   photo: { type: String },
   about: { type: String },
   businessHours : { type : Array, default : [] },
   businessTimeZone : { type: String },
   businessCurrency : { type: String },
   ownerId: { type: mongoose.Types.ObjectId, ref: 'User' },
   createdAt: {
      type: Date,
      default: Date.now()
   },
   updatedAt: {
      type: Date,
      default: Date.now()
   }
})

function validateBusiness(business) {
   const schema = Joi.object({
       id: Joi.objectId(),
       name: Joi.string().min(2).max(50).required(),
       countryCode: Joi.string(),
       mobile: Joi.string(),
       industry: Joi.string(),
       businessTimeZone: Joi.string().required(),
       businessCurrency:  Joi.string().required(),
       businessHours : Joi.array().min(7).required()

   })
   return schema.validate(business);
}

businessSchema.plugin(mongoosePaginate);
businessSchema.plugin(aggregatePaginate);
const Business = mongoose.model('Business', businessSchema);

exports.Business = Business;
exports.validate = validateBusiness;