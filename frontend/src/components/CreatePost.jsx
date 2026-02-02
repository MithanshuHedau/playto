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
    <div className="card">
      <h2 className="text-xl font-bold mb-4">Create a Post</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Your Name
          </label>
          <input
            type="text"
            className="input-field"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
          />
        </div>
        <textarea
          className="input-field resize-none"
          rows="4"
          placeholder="What's on your mind?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={loading}
        />
        <div className="flex justify-end mt-3">
          <button
            type="submit"
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading || !content.trim() || !username.trim()}
          >
            {loading ? "Posting..." : "Post"}
          </button>
        </div>
      </form>
    </div>
  );
}
