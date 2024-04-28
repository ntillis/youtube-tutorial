const mongoose = require('mongoose');
const TagSchema = require('./Tag');

const Schema = mongoose.Schema;

const CommentSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    approved: {
        type: Boolean,
        default: false
    }
});

const PostSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    },
    comments: [CommentSchema],
    tags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Post', PostSchema);