import { useState } from "react";
import { createPost, getOrCreateUser } from "../api";
import axios from "axios";

export default function CreatePost({ onPostCreated }) {
  const [content, setContent] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || !username.trim()) return;

    setLoading(true);
    try {
      // Get or create user by username
      const userResponse = await getOrCreateUser(username.trim());

      const userId = userResponse.data.id;

      // Create post with the user ID
      await createPost({ content, author: userId });
      setContent("");
      // Keep username for next post
      onPostCreated();
    } catch (error) {
      console.error("Error creating post:", error);
      console.error("Error details:", error.response?.data);
      alert(
        `Failed to create post: ${error.response?.data?.detail || error.message}`,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card mb-8 border-t-4 border-t-indigo-500">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
          Create a Post
        </h2>
        <div className="text-2xl h-8 w-8 flex items-center justify-center rounded-full bg-slate-700/50">
          ✨
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5 ml-1">
            Posting as
          </label>
          <input
            type="text"
            className="input-field w-full bg-slate-900/50 focus:bg-slate-900 transition-colors text-lg p-4"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
          />
        </div>

        <div>
          <textarea
            className="input-field w-full min-h-[140px] bg-slate-900/50 focus:bg-slate-900 transition-colors resize-none text-lg p-4"
            placeholder="What's happening?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="btn-primary flex items-center gap-2"
            disabled={loading || !content.trim() || !username.trim()}
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                <span>Posting...</span>
              </>
            ) : (
              <>
                <span>Post Update</span>
                <span>🚀</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
