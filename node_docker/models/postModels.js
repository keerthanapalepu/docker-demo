const mongoose = require("mongoose")

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        require: true
    },
    body: {
        type: String,
        require: true
    }
})


const Post = mongoose.model("Post", postSchema);
module.exports = Post;