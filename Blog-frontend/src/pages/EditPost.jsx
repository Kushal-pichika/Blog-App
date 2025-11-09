import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Pencil } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";

function EditPost() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const { id } = useParams();
  const navigate = useNavigate();

  // ✅ Fetch existing post details
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(`http://localhost:31354/api/posts/${id}`);
        if (res.ok) {
          const data = await res.json();
          setTitle(data.title);
          setContent(data.content);
        } else {
          toast.error("Post not found!");
        }
      } catch (err) {
        console.error("Error fetching post:", err);
        toast.error("Failed to fetch post details!");
      }
    };
    fetchPost();
  }, [id]);

  // ✅ Update post
  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      toast.error("Please fill in all fields!");
      return;
    }

    try {
      const res = await fetch(`http://localhost:31354/api/posts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });

      if (res.ok) {
        toast.success("Post updated successfully!");
        setTimeout(() => navigate("/"), 800);
      } else {
        toast.error("Failed to update post!");
      }
    } catch (err) {
      console.error("Error updating post:", err);
      toast.error("Something went wrong!");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="max-w-2xl mx-auto glass p-10 rounded-2xl shadow-2xl mt-10 relative"
    >
      {/* Top Gradient Line */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-yellow-400 to-pink-400"></div>

      <h2 className="text-3xl font-futuristic text-center text-yellow-400 mb-6 flex justify-center items-center gap-2">
        <Pencil /> Edit Post
      </h2>

      <form onSubmit={handleUpdate} className="space-y-6">
        <div>
          <label className="block text-gray-300 mb-2">Title</label>
          <input
            type="text"
            placeholder="Edit post title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 rounded-md bg-transparent border border-gray-700 text-white focus:border-yellow-400 focus:outline-none transition"
          />
        </div>

        <div>
          <label className="block text-gray-300 mb-2">Content</label>
          <textarea
            placeholder="Update your post content..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-40 p-3 rounded-md bg-transparent border border-gray-700 text-white focus:border-pink-400 focus:outline-none transition resize-none"
          ></textarea>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.9, transition: { duration: 0.05 } }}
          type="submit"
          className="w-full bg-gradient-to-r from-yellow-500 to-pink-500 py-3 rounded-md text-white font-semibold hover:opacity-90 transition-all"
        >
          Update Post
        </motion.button>
      </form>
    </motion.div>
  );
}

export default EditPost;
