const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const aggregatePaginate = require('mongoose-aggregate-paginate-v2');
const Joi = require('joi')
Joi.objectId = require('joi-objectid')(Joi)

// Table comments as C {
//     id int [pk, increment] // auto-increment
//     user_id int [ref: > users.id]
//     post_id int [ref: > posts.id]
//     comment_text varchar
//     parent_comment_id int [ref: > comments.id]
//     is_best boolean
//     reactions "array [{userid int, identifier varchar}]"
//     attachment varchar
//     created_at datetime [default: `now()`]
//     updated_at datetime [default: `now()`]
//   }

const commentSchema = new mongoose.Schema({
    userId: { type: mongoose.Types.ObjectId, ref: 'User' },
    postId: { type: mongoose.Types.ObjectId, ref: 'Post' },
    commentText: { type: String },
    isBest: { type : 'boolean', default : false },
    parentCommentId: { type: mongoose.Types.ObjectId, ref: 'Comment' },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    updatedAt: {
        type: Date,
        default: Date.now()
    }
})

commentSchema.plugin(mongoosePaginate);
commentSchema.plugin(aggregatePaginate);
const Comment = mongoose.model('Comment', commentSchema);

exports.Comment = Comment;