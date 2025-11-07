import React, { useEffect, useState } from "react";
import PostCard from "../components/PostCard";
import { motion } from "framer-motion";
import toast from "react-hot-toast";


function Home() {
  const [posts, setPosts] = useState([]);

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`localhost:31354/api/posts/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Post deleted!");
        setPosts((prevPosts) => prevPosts.filter((p) => p._id !== id));
      } else {
        toast.error("Failed to delete post!");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("⚠️ Error deleting post");
    }
  };

  useEffect(() => {
    fetch(`http://localhost:31354/api/posts`)
      .then((res) => res.json())
      .then((data) => setPosts(data))
      .catch((err) => console.error("Fetch error:", err));
  }, []);

  return (
    <motion.div
      className="relative z-10"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <motion.h1
        className="text-3xl font-futuristic text-center mb-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <span className="text-neon-blue">Latest</span>{" "}
        <span className="text-neon-pink">Posts</span>
      </motion.h1>

      {posts.length > 0 ? (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <motion.div
              key={post._id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              <PostCard post={post} onDelete={handleDelete} />
            </motion.div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-400 text-lg mt-20">
          No posts yet...
        </p>
      )}
    </motion.div>
  );
}

export default Home;
