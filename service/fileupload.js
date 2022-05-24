const multer = require('multer');
const fs = require('fs');
const _ = require("lodash");
const config = require("config");
const serverurl = config.get('serverurl');

let storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, './public/images');
	},
	filename: function (req, file, cb) {
		let datetimestamp = Date.now();
		cb(null, Date.now() + "-" + file.originalname);
	}
});

let upload = multer({
	limits: {fileSize: 10000000}, // set limit here (10MB)
	fileFilter: function (req, file, cb) {
		sanitizeFile(file, cb);
	},
	storage: storage
}).single('photo');

let uploadfile = (req, res, next) => {
	//console.log("file upload calling..");
	let path = '';
	upload(req, res, function (err, data) {
		if (err) {
         return res.status(403).send(err.message);
		}
		// if (req.file == undefined && !(typeof req.body.photo === 'string')) {
      //    return res.status(403).send("No file selected!");
		// }
		if (req.file) {
			// console.log("file", req.file, req.file.filename);
		   let path = req.file.path;
			let filename = req.file.filename;
			req.body.photo = serverurl + '/' +  filename;
			next();
		} else {
			next();
		}
	});
}

let deletefile = (filepath) => {
	deletepath = filepath.split(serverurl)[1];
	fs.unlinkSync("public/images" + deletepath, function (err) {
		if (err) throw err;
		//console.log("File deleted!");
	});
	return true;
};

function sanitizeFile(file, cb) {

	let fileExts = ['png', 'jpg', 'jpeg', 'gif'];
	let isAllowedExt = fileExts.includes(file.originalname.split('.')[1].toLowerCase());
	if (isAllowedExt) {
		return cb(null, true)
	} else {
		return cb("File type not allowed!", false)
	}
}

module.exports = {
	uploadfile,
	deletefile
}
