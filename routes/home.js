const express = require('express');
const router = express.Router();


router.get('/',(req,res) => {       
   // res.send("hello");
   res.render('index',{title:"pug",message:"Express js"})
})

module.exports = router;
