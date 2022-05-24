const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const aggregatePaginate = require('mongoose-aggregate-paginate-v2');
const Joi = require('joi')
Joi.objectId = require('joi-objectid')(Joi)

// user_id int [ref: > users.id]
//   user_type int
//   title varchar
//   description varchar
//   post_type int [ref: > post_types.id]
//   options "array [{title varchar, attachment varchar, users array }]"
//   is_anonymously boolean
//   is_multiple boolean
//   poll_duration datetime
//   result_declaration_type int
//   badge int [ref: > badges.id]
//   status int // draft live 
//   visibility_type int
//   visibility_values array
//   is_pinto_top boolean
//   pinto_top_untill datetime
//   is_email_send boolean
//   is_disable_comment boolean
//   tags array [ref: < tags.id]
//   emotion_icon varchar
//   emotion_text varchar
//   is_read_conformation boolean
//   read_conformation array [ref: > users.id]
//   mentions array [ref: > users.id]
//   likes array [ref: > users.id]
//   views array [ref: > users.id]
//   attachments array
//   slug varchar [unique]
//   publish_at datetime [default: `now()`]
//   created_at datetime [default: `now()`]
//   updated_at datetime [default: `now()`]

const postSchema = new mongoose.Schema({
    title: { type: String },
    userId: { type: mongoose.Types.ObjectId, ref: 'User' },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    updatedAt: {
        type: Date,
        default: Date.now()
    }
})

postSchema.plugin(mongoosePaginate);
postSchema.plugin(aggregatePaginate);
const Post = mongoose.model('Post', postSchema);

exports.Post = Post;