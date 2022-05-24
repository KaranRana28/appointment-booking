const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const aggregatePaginate = require('mongoose-aggregate-paginate-v2');
const Joi = require('joi')
Joi.objectId = require('joi-objectid')(Joi)

const activitySchema = new mongoose.Schema({
   message: { type: String, required: true },
   action: { type: String, enum: ['Created', 'Updated','Deleted'] },
   model : { type: String }, // staff , service , appoinment
   businessId: { type: mongoose.Types.ObjectId, ref: 'Business' },
   staffId: { type: mongoose.Types.ObjectId, ref: 'Staff' },
   createdAt: {
      type: Date,
      default: Date.now()
   },
   updatedAt: {
      type: Date,
      default: Date.now()
   }
})

activitySchema.plugin(mongoosePaginate);
activitySchema.plugin(aggregatePaginate);
const Activity = mongoose.model('Activity', activitySchema);

exports.Activity = Activity;