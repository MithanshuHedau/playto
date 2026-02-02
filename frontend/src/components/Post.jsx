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
    <div className="card animate-slide-up group">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-500/20">
            {post.author.username[0].toUpperCase()}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-[var(--text-primary)] text-lg">
              {post.author.username}
            </h3>
            <span className="text-[var(--text-secondary)] text-sm">•</span>
            <span className="text-[var(--text-secondary)] text-sm">
              {new Date(post.created_at).toLocaleString(undefined, {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>

          <p className="text-gray-100 text-lg mb-6 leading-relaxed whitespace-pre-wrap">
            {post.content}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-slate-700/50">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-200 ${
                liked
                  ? "bg-rose-500/10 text-rose-500 hover:bg-rose-500/20"
                  : "bg-slate-700/30 text-slate-400 hover:bg-slate-700 hover:text-rose-400"
              }`}
            >
              <span
                className={`text-lg transition-transform ${liked ? "scale-110" : ""}`}
              >
                {liked ? "❤️" : "🤍"}
              </span>
              <span className="font-medium text-sm">{likes}</span>
            </button>

            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-700/30 text-slate-400 hover:bg-slate-700 hover:text-indigo-400 transition-all duration-200"
            >
              <span className="text-lg">💬</span>
              <span className="font-medium text-sm">
                {commentCount} {showComments ? "Hide" : "Comments"}
              </span>
            </button>

            <button
              onClick={() => setShowCommentForm(!showCommentForm)}
              className="ml-auto text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Reply to Post
            </button>
          </div>

          {showCommentForm && (
            <form
              onSubmit={handleComment}
              className="mt-6 bg-slate-900/50 p-4 rounded-lg border border-slate-700/50 animate-fade-in"
            >
              <div className="mb-3">
                <input
                  type="text"
                  className="input-field text-sm bg-slate-800"
                  placeholder="Your name"
                  value={commentUsername}
                  onChange={(e) => setCommentUsername(e.target.value)}
                />
              </div>
              <textarea
                className="input-field min-h-[100px] bg-slate-800"
                placeholder="What are your thoughts?"
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
              />
              <div className="flex gap-3 mt-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowCommentForm(false)}
                  className="btn-secondary text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary text-sm"
                  disabled={!commentContent.trim() || !commentUsername.trim()}
                >
                  Post Comment
                </button>
              </div>
            </form>
          )}

          {showComments && post.comments && (
            <div
              className={`mt-6 space-y-4 pl-4 border-l-2 border-slate-700/50 ${showComments ? "animate-slide-down" : ""}`}
            >
              <CommentThread
                comments={post.comments}
                postId={post.id}
                onCommentAdded={onUpdate}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
