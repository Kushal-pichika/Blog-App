import React, { useState } from "react";
import { motion } from "framer-motion";
import { PenTool } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";


function AddPost() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      toast.error("Please fill in all fields!");
      return;
    }

    try {
      const res = await fetch(`http://blog-backend:5000/api/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });

      if (res.ok) {
        toast.success("Post added successfully!");
        setTitle("");
        setContent("");

        setTimeout(() => navigate("/"), 800);
      } else {
        toast.error("Failed to add post!");
      }
    } catch (err) {
      console.error("Error adding post:", err);
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
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-blue-400 to-pink-400"></div>

      <h2 className="text-3xl font-futuristic text-center text-blue-400 mb-6 flex justify-center items-center gap-2">
        <PenTool /> Create Post
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-gray-300 mb-2">Title</label>
          <input
            type="text"
            placeholder="Enter post title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 rounded-md bg-transparent border border-gray-700 text-white focus:border-blue-400 focus:outline-none transition"
          />
        </div>

        <div>
          <label className="block text-gray-300 mb-2">Content</label>
          <textarea
            placeholder="Write your amazing content..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-40 p-3 rounded-md bg-transparent border border-gray-700 text-white focus:border-pink-400 focus:outline-none transition resize-none"
          ></textarea>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.9, transition: { duration: 0.05 } }}
          type="submit"
          className="w-full bg-gradient-to-r from-blue-500 to-pink-500 py-3 rounded-md text-white font-semibold hover:opacity-90 transition-all"
        >
          Publish Post
        </motion.button>
      </form>
    </motion.div>
  );
}

export default AddPost;
