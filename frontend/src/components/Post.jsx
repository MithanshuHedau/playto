import { useState } from "react";
import { likePost, unlikePost, createComment, getOrCreateUser } from "../api";
import CommentThread from "./CommentThread";
import axios from "axios";

export default function Post({ post, onUpdate }) {
  const [showComments, setShowComments] = useState(false); // Hidden by default
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [commentContent, setCommentContent] = useState("");
  const [commentUsername, setCommentUsername] = useState("");
  const [likes, setLikes] = useState(post.like_count);
  const [liked, setLiked] = useState(false);

  const handleLike = async () => {
    try {
      if (liked) {
        // Unlike
        await unlikePost(post.id);
        setLikes(likes - 1);
        setLiked(false);
      } else {
        // Like
        await likePost(post.id);
        setLikes(likes + 1);
        setLiked(true);
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentContent.trim() || !commentUsername.trim()) return;

    try {
      // Get or create user
      const userResponse = await getOrCreateUser(commentUsername.trim());

      await createComment({
        post: post.id,
        content: commentContent,
        author: userResponse.data.id,
      });
      setCommentContent("");
      setCommentUsername("");
      setShowCommentForm(false);
      onUpdate();
    } catch (error) {
      console.error("Error creating comment:", error);
    }
  };

  const commentCount =
    post.comment_count || (post.comments ? post.comments.length : 0);

  return (
    <div className="card animate-slide-up">
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold">
              {post.author.username[0].toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-gray-800">
                {post.author.username}
              </p>
              <p className="text-xs text-gray-500">
                {new Date(post.created_at).toLocaleString()}
              </p>
            </div>
          </div>

          <p className="text-gray-800 text-lg mb-4">{post.content}</p>

          <div className="flex items-center gap-6">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 ${
                liked ? "text-red-500" : "text-gray-600 hover:text-red-500"
              } transition-colors font-medium`}
            >
              <span className="text-xl">{liked ? "❤️" : "🤍"}</span>
              <span>{likes} Likes</span>
            </button>

            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors font-medium"
            >
              <span>💬</span>
              <span>
                {commentCount} Comments {showComments ? "▼" : "▶"}
              </span>
            </button>

            <button
              onClick={() => setShowCommentForm(!showCommentForm)}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Add Comment
            </button>
          </div>

          {showCommentForm && (
            <form onSubmit={handleComment} className="mt-4">
              <div className="mb-2">
                <input
                  type="text"
                  className="input-field text-sm"
                  placeholder="Your name"
                  value={commentUsername}
                  onChange={(e) => setCommentUsername(e.target.value)}
                />
              </div>
              <textarea
                className="input-field"
                rows="3"
                placeholder="Write a comment..."
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
              />
              <div className="flex gap-2 mt-2">
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={!commentContent.trim() || !commentUsername.trim()}
                >
                  Comment
                </button>
                <button
                  type="button"
                  onClick={() => setShowCommentForm(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {showComments && post.comments && (
            <CommentThread
              comments={post.comments}
              postId={post.id}
              onCommentAdded={onUpdate}
            />
          )}
        </div>
      </div>
    </div>
  );
}
