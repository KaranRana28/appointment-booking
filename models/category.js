const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const aggregatePaginate = require('mongoose-aggregate-paginate-v2');
const Joi = require('joi')
Joi.objectId = require('joi-objectid')(Joi)

const categorySchema = new mongoose.Schema({
   name: { type: String, required: true },
   type: { type : Number, required: true },
   businessId: { type: mongoose.Types.ObjectId, ref: 'Business' },
   createdAt: {
      type: Date,
      default: Date.now()
   },
   updatedAt: {
      type: Date,
      default: Date.now()
   }
})

function validateCategory(category) {
   const schema = Joi.object({
       id: Joi.objectId(),
       name: Joi.string().min(2).max(50).required()
   })
   return schema.validate(category);
}

categorySchema.plugin(mongoosePaginate);
categorySchema.plugin(aggregatePaginate);
const Category = mongoose.model('Category', categorySchema);

exports.Category = Category;
exports.validate = validateCategory;