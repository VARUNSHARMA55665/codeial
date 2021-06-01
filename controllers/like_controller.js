const Like = require('../models/like');
const Post = require('../models/post');
const Comment = require('../models/comment')

module.exports.toggleLike = async function(req,res){
    try {

        // likes/toggle/?id = abcdef&type = Post
        let likeable;
        let deleted = false;

        if(req.query.type == 'Post'){
            likeable = Post.findById(req.query.id).populate('likes');
        }else{
            likeable = Comment.findById(req.query.id).populate('likes');
        }

        // check if like already exists
        let existingLike = await Like.findOne({
            likeable: req.query.id,
            onModel: req.query.type,
            user: req.user._id
        });

        if(existingLike){
            likeable.likes.pull(existingLike._id);
            likeable.save();

            existingLike.remove();
            deleted = true;

        }else{
            // else make a like
            
            let newLike = await Like.create({
                user: req.user._id,
                likeable: req.query.id,
                onModel: req.query.type
            });

            likeable.likes.push(newLike._id);
            likeable.save();

        }

        return res.json({
            message: "Request successful!",
            data: {
                deleted: deleted
            }
        });
        
    }catch(err){
        console.log(err);
        return res.json(500, {
            message: "Internal Server Error"
        });
    }

}