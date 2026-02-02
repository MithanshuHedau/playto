import { useState } from "react";
import {
  likeComment,
  unlikeComment,
  createComment,
  getOrCreateUser,
} from "../api";
import axios from "axios";

export default function CommentThread({ comments, postId, onCommentAdded }) {
  return (
    <div className="space-y-3 mt-4">
      {comments.map((comment) => (
        <Comment
          key={comment.id}
          comment={comment}
          postId={postId}
          onCommentAdded={onCommentAdded}
        />
      ))}
    </div>
  );
}

function Comment({ comment, postId, onCommentAdded, level = 0 }) {
  const [showReply, setShowReply] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [replyUsername, setReplyUsername] = useState("");
  const [likes, setLikes] = useState(comment.like_count);
  const [liked, setLiked] = useState(false);

  const handleLike = async () => {
    try {
      if (liked) {
        // Unlike
        console.log("Unliking comment:", comment.id);
        const response = await unlikeComment(comment.id);
        console.log("Unlike response:", response.data);
        setLikes(likes - 1);
        setLiked(false);
      } else {
        // Like
        console.log("Liking comment:", comment.id);
        const response = await likeComment(comment.id);
        console.log("Like response:", response.data);
        setLikes(likes + 1);
        setLiked(true);
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      console.error("Error details:", error.response?.data);
      alert(
        `Failed to toggle like: ${error.response?.data?.error || error.message}`,
      );
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyContent.trim() || !replyUsername.trim()) return;

    try {
      // Get or create user
      const userResponse = await getOrCreateUser(replyUsername.trim());

      await createComment({
        post: postId,
        parent: comment.id,
        content: replyContent,
        author: userResponse.data.id,
      });
      setReplyContent("");
      setReplyUsername("");
      setShowReply(false);
      onCommentAdded();
    } catch (error) {
      console.error("Error creating reply:", error);
    }
  };

  const indent = Math.min(level * 20, 60); // Max indent of 60px

  return (
    <div
      className="border-l-2 border-gray-200 pl-4 animate-fade-in"
      style={{ marginLeft: `${indent}px` }}
    >
      <div className="bg-gray-50 rounded-lg p-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="font-semibold text-sm text-gray-700">
              {comment.author.username}
              <span className="text-xs text-gray-400 ml-2">
                Level {comment.level}
              </span>
            </p>
            <p className="text-gray-800 mt-1">{comment.content}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 mt-2 text-sm">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1 ${
              liked ? "text-red-500" : "text-gray-500 hover:text-red-500"
            } transition-colors`}
          >
            <span>{liked ? "❤️" : "🤍"}</span>
            <span>{likes}</span>
          </button>

          <button
            onClick={() => setShowReply(!showReply)}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Reply
          </button>

          <span className="text-gray-400 text-xs">
            {new Date(comment.created_at).toLocaleString()}
          </span>
        </div>

        {showReply && (
          <form onSubmit={handleReply} className="mt-3">
            <div className="text-xs text-gray-500 mb-2 italic">
              Replying to{" "}
              <span className="font-semibold">{comment.author.username}</span>
            </div>
            <input
              type="text"
              className="input-field text-sm mb-2"
              placeholder="Your name"
              value={replyUsername}
              onChange={(e) => setReplyUsername(e.target.value)}
            />
            <textarea
              className="input-field text-sm"
              rows="2"
              placeholder="Write a reply..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
            />
            <div className="flex gap-2 mt-2">
              <button
                type="submit"
                className="btn-primary text-sm py-1"
                disabled={!replyContent.trim() || !replyUsername.trim()}
              >
                Reply
              </button>
              <button
                type="button"
                onClick={() => setShowReply(false)}
                className="btn-secondary text-sm py-1"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-3">
          {comment.replies.map((reply) => (
            <Comment
              key={reply.id}
              comment={reply}
              postId={postId}
              onCommentAdded={onCommentAdded}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
