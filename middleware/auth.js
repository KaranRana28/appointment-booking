const config = require("config");
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const { User } = require('../models/user');
const response = require('../response_model/response');

module.exports = async function (req, res, next) {

   const token = req.header('authorization');
   if (!token) {
      let result = response.unProcessable('Access denied. No token provided.');
      return res.status(result.code).send(result);
   }

   try {
      let decoded = jwt.verify(token, config.get("jwtPrivateKey"))
      let verifyUser = await User.findOne({ _id: decoded._id })
      if (verifyUser) {
         req.user = verifyUser;
         next();
      }
      else {
         let result = response.unAuthorized('Invalid token');
         return res.status(result.code).send(result);
      }

   } catch (ex) {
      let result = response.fail(ex.message);
      return res.status(result.code).send(result);
   }
}