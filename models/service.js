const mongoose = require('mongoose')
const Joi = require('joi')
Joi.objectId = require('joi-objectid')(Joi)
const mongoosePaginate = require('mongoose-paginate-v2');
const aggregatePaginate = require('mongoose-aggregate-paginate-v2');

const serviceSchema = new mongoose.Schema({
   name: { type: String, required: true },
   businessId: { type: mongoose.Types.ObjectId, ref: 'Business' },
   description: { type: String },
   photo: { type: String },
   cost: { type: Number , default : 0},
   time: { type: Number },
   categories: [{ type : mongoose.Types.ObjectId, ref: 'Category', default : [] }],
   staffs: [{ type : mongoose.Types.ObjectId, ref: 'Staff', default : [] }],
   createdAt: {
      type: Date,
      default: Date.now()
   },
   updatedAt: {
      type: Date,
      default: Date.now()
   }
})

function validateService(service) {
   const schema = Joi.object({
       id: Joi.objectId(),
       name: Joi.string().min(2).max(50).required(),
       time: Joi.number().required(),
       staffs: Joi.array().min(1).required(),
       description: Joi.any(),
       cost: Joi.number(),
       categories: Joi.array(),
       photo: Joi.string()
   })
   return schema.validate(service);
}

serviceSchema.plugin(mongoosePaginate);
serviceSchema.plugin(aggregatePaginate);
const Service = mongoose.model('Service', serviceSchema);

exports.Service = Service;
exports.validate = validateService;