const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const aggregatePaginate = require('mongoose-aggregate-paginate-v2');
const Joi = require('joi')
Joi.objectId = require('joi-objectid')(Joi)

const appointmentSchema = new mongoose.Schema({
   staffId: { type: mongoose.Types.ObjectId, ref: 'Staff'},
   serviceId: { type: mongoose.Types.ObjectId, ref: 'Service'},
   customerId: { type: mongoose.Types.ObjectId, ref: 'Customer'},
   businessId: { type: mongoose.Types.ObjectId, ref: 'Business'},
   cost : { type : Number },
   duration : { type : Number },
   startDateTime : { type : Date , default : Date.now() },
   endDateTime : { type : Date , default : Date.now() },
   notes : { type: String },
   lable : { type: String },
   createdAt: {
      type: Date,
      default: Date.now()
   },
   updatedAt: {
      type: Date,
      default: Date.now()
   }
})

function validateAppointment(appointment) {
   const schema = Joi.object({
       id: Joi.objectId(),
       staffId: Joi.objectId().required(),
       serviceId: Joi.objectId().required(),
       customerId: Joi.objectId().required(),
       startDateTime: Joi.string().required(),
       endDateTime: Joi.string().required(),
       cost : Joi.number().required(),
       duration : Joi.number().required(),
       notes: Joi.string(),
       lable: Joi.string()
   })
   return schema.validate(appointment);
}

appointmentSchema.plugin(mongoosePaginate);
appointmentSchema.plugin(aggregatePaginate);
const Appointment = mongoose.model('Appointment', appointmentSchema);

exports.Appointment = Appointment;
exports.validate = validateAppointment;