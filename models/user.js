const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const Joi = require('joi')
Joi.objectId = require('joi-objectid')(Joi)
const bcrypt = require('bcryptjs');
const config = require("config");
const mongoosePaginate = require('mongoose-paginate-v2');
const aggregatePaginate = require('mongoose-aggregate-paginate-v2');

const userSchema = new mongoose.Schema({
   name: { type: String, required: true },
   email: { type: String, required: true, unique: true },
   password: { type: String, required: true },
   countryCode: { type: String },
   mobile: { type: String },
   businessId: { type: mongoose.Types.ObjectId, ref: 'Business' },
   isAdmin: { type : Boolean },
   isActive: { type : Boolean },
   createdAt: {
      type: Date,
      default: Date.now()
   },
   updatedAt: {
      type: Date,
      default: Date.now()
   }
});

userSchema.methods.generateHash = async function (pass) {
   const salt = await bcrypt.genSalt(10);
   return await bcrypt.hash(pass, salt);
}

userSchema.methods.generateAuthToken = async function (user) {
   const token = jwt.sign({_id : user.id}, config.get("jwtPrivateKey"));
   return token;
}

userSchema.plugin(mongoosePaginate);
userSchema.plugin(aggregatePaginate);
const User = mongoose.model('User', userSchema)

function validateUser(user) {
   const schema = Joi.object({
       id: Joi.objectId(),
       name: Joi.string().min(2).max(50).required(),
       email: Joi.string().required().email(),
       password: Joi.string().required(),
   })
   return schema.validate(user);
}

exports.User = User;
exports.validate = validateUser;