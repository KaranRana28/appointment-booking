const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const aggregatePaginate = require('mongoose-aggregate-paginate-v2');
const Joi = require('joi')
Joi.objectId = require('joi-objectid')(Joi)

const customerSchema = new mongoose.Schema({
   name: { type: String, required: true },
   email: { type: String, required: true },
   businessId: { type: mongoose.Types.ObjectId, ref: 'Business' },
   countryCode: { type: String },
   mobile: { type: String },
   photo: { type: String },
   office: { type: String },
   home: { type: String },
   address: { type: String },
   city : { type : String },
   state : { type : String },
   zip : { type : String },
   note : { type : String },
   createdAt: {
      type: Date,
      default: Date.now()
   },
   updatedAt: {
      type: Date,
      default: Date.now()
   }
})

function validateCustomer(customer) {
   const schema = Joi.object({
       id: Joi.objectId(),
       name: Joi.string().min(2).max(50).required(),
       email: Joi.string().required(),
       countryCode: Joi.any(),
       mobile: Joi.any()
   })
   return schema.validate(customer);
}

customerSchema.plugin(mongoosePaginate);
customerSchema.plugin(aggregatePaginate);
const Customer = mongoose.model('Customer', customerSchema);

exports.Customer = Customer;
exports.validate = validateCustomer;