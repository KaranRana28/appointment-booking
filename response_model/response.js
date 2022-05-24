function Response() {
   this.code = 200;
   this.success = true;
   this.message = "";
   this.data = {};
}

function FailResponse() {
   this.code = 500;
   this.success = false;
   this.error = "";
}

module.exports = {

   success: function(message, data) {
      let res = new Response();
      res.code = 200;
      res.success = true;
      res.message = message;
      res.data = data;
      return res;
   },
   created: function(message, data) {
      let res = new Response();
      res.code = 201;
      res.success = true;
      res.message = message;
      res.data = data;
      return res;
   },
   unProcessable : function(message, data) {
      let res = new FailResponse();
      res.code = 400;
      res.success = false;
      res.error = message;
      return res;
   },
   unAuthorized: function(message, data) {
      let res = new FailResponse();
      res.code = 401;
      res.success = false;
      res.error = message;
      return res;
   },
   forbidden: function(message, data) {
      let res = new FailResponse();
      res.code = 403;
      res.success = false;
      res.error = message;
      return res;
   },
   notFound: function(message, data) {
      let res = new FailResponse();
      res.code = 404;
      res.success = false;
      res.error = message;
      return res;
   },
   fail: function(message, data) {
      let res = new FailResponse();
      res.code = 500;
      res.success = false;
      res.error = message;
      return res;
   }
};