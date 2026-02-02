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
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Sticky Glass Header */}
      <nav className="glass mb-8">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚡</span>
            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
              Playto Feed
            </h1>
          </div>
          <div className="text-sm text-[var(--text-secondary)]">v1.0.0</div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 pb-12">
        <header className="mb-10 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-3 tracking-tight">
            Join the Conversation
          </h2>
          <p className="text-[var(--text-secondary)] max-w-2xl mx-auto text-lg leading-relaxed">
            Share your thoughts, engage in deep discussions, and earn karma to
            climb the leaderboard!
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Feed */}
          <div className="lg:col-span-8 space-y-6">
            <CreatePost onPostCreated={handlePostCreated} />

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="card animate-pulse border-none">
                    <div className="flex gap-4 mb-4">
                      <div className="w-10 h-10 rounded-full bg-slate-700"></div>
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-slate-700 rounded w-1/4"></div>
                        <div className="h-3 bg-slate-700 rounded w-1/6"></div>
                      </div>
                    </div>
                    <div className="h-4 bg-slate-700 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-slate-700 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="card text-center py-16 bg-slate-800/50">
                <div className="text-4xl mb-4">📭</div>
                <h3 className="text-xl font-medium text-[var(--text-primary)] mb-2">
                  No posts yet
                </h3>
                <p className="text-[var(--text-secondary)]">
                  Be the first to spark a conversation!
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
          <div className="lg:col-span-4 space-y-6">
            <div className="sticky top-24">
              <Leaderboard />

              <div className="mt-6 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-center">
                <h4 className="font-bold text-white mb-1">🚀 Pro Tip</h4>
                <p className="text-sm text-gray-100">
                  Earn karma by receiving likes on your posts and comments.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
