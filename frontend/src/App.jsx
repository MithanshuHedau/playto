import { useState, useEffect } from "react";
import { getPosts, getPost } from "./api";
import CreatePost from "./components/CreatePost";
import Post from "./components/Post";
import Leaderboard from "./components/Leaderboard";
import "./index.css";

function App() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await getPosts();
      const postList = response.data.results || response.data;

      // Fetch full details for each post to get nested comments
      const postsWithComments = await Promise.all(
        postList.map(async (post) => {
          try {
            const fullPost = await getPost(post.id);
            return fullPost.data;
          } catch (error) {
            console.error(`Error fetching post ${post.id}:`, error);
            return post;
          }
        }),
      );

      setPosts(postsWithComments);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching posts:", error);
      setLoading(false);
    }
  };

  const handlePostCreated = () => {
    fetchPosts();
  };

  const handlePostUpdate = async (postId) => {
    try {
      const response = await getPost(postId);
      setPosts(posts.map((p) => (p.id === postId ? response.data : p)));
    } catch (error) {
      console.error("Error updating post:", error);
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🌟 Community Feed
          </h1>
          <p className="text-gray-600">
            Share your thoughts, engage in discussions, and earn karma!
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-6">
            <CreatePost onPostCreated={handlePostCreated} />

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="card animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="card text-center py-12">
                <p className="text-gray-500 text-lg">
                  No posts yet. Be the first to share something!
                </p>
              </div>
            ) : (
              posts.map((post) => (
                <Post
                  key={post.id}
                  post={post}
                  onUpdate={() => handlePostUpdate(post.id)}
                />
              ))
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Leaderboard />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
