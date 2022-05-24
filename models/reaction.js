const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const aggregatePaginate = require('mongoose-aggregate-paginate-v2');
const Joi = require('joi')
Joi.objectId = require('joi-objectid')(Joi)

const reactionSchema = new mongoose.Schema({
    userId: { type: mongoose.Types.ObjectId, ref: 'User' },
    postId: { type: mongoose.Types.ObjectId, ref: 'Post' },
    commentId: { type: mongoose.Types.ObjectId, ref: 'Comment' },
    reactionIdentifier: { type: String },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    updatedAt: {
        type: Date,
        default: Date.now()
    }
})

reactionSchema.plugin(mongoosePaginate);
reactionSchema.plugin(aggregatePaginate);
const Reaction = mongoose.model('Reaction', reactionSchema);

exports.Reaction = Reaction;