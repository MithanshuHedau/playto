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
      className="border-l-2 border-slate-700/50 pl-4 animate-fade-in"
      style={{ marginLeft: level > 0 ? "12px" : "0" }}
    >
      <div className="bg-slate-800/40 rounded-lg p-3 border border-slate-700/30 hover:border-slate-600/50 transition-colors">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="font-semibold text-sm text-[var(--text-primary)] flex items-center gap-2">
              {comment.author.username}
              <span className="text-xs text-[var(--text-secondary)] bg-slate-700/50 px-1.5 py-0.5 rounded">
                Lvl {comment.level}
              </span>
            </p>
            <p className="text-gray-200 mt-1.5 leading-relaxed">
              {comment.content}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 mt-3 text-sm">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 px-2 py-1 rounded transition-colors ${
              liked
                ? "text-rose-500 bg-rose-500/10"
                : "text-slate-400 hover:text-rose-400 hover:bg-slate-700/50"
            }`}
          >
            <span>{liked ? "❤️" : "🤍"}</span>
            <span className="font-medium">{likes}</span>
          </button>

          <button
            onClick={() => setShowReply(!showReply)}
            className="text-indigo-400 hover:text-indigo-300 font-medium hover:underline decoration-indigo-400/30 underline-offset-4"
          >
            Reply
          </button>

          <span className="text-slate-500 text-xs ml-auto">
            {new Date(comment.created_at).toLocaleString(undefined, {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>

        {showReply && (
          <form
            onSubmit={handleReply}
            className="mt-4 bg-slate-900/50 p-3 rounded border border-slate-700/50"
          >
            <div className="text-xs text-indigo-300 mb-2 flex items-center gap-1">
              <span>↳</span> Replying to{" "}
              <span className="font-semibold text-white">
                {comment.author.username}
              </span>
            </div>
            <input
              type="text"
              className="input-field text-sm mb-2 bg-slate-800"
              placeholder="Your name"
              value={replyUsername}
              onChange={(e) => setReplyUsername(e.target.value)}
            />
            <textarea
              className="input-field text-sm bg-slate-800"
              rows="2"
              placeholder="Write a reply..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
            />
            <div className="flex gap-2 mt-2 justify-end">
              <button
                type="button"
                onClick={() => setShowReply(false)}
                className="btn-secondary text-sm py-1 px-3"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary text-sm py-1 px-3"
                disabled={!replyContent.trim() || !replyUsername.trim()}
              >
                Reply
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
