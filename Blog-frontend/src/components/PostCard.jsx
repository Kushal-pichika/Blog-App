import React from "react";
import { motion } from "framer-motion";
import { Trash, Pencil } from "lucide-react";
import { Link } from "react-router-dom";

function PostCard({ post, onDelete }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 200 }}
      className="glass p-6 rounded-xl shadow-xl cursor-pointer border border-gray-700 hover:border-neon-blue"
    >
      {/* Post Title */}
      <h2 className="text-xl font-semibold text-neon-blue mb-2">
        {post.title}
      </h2>

      {/* Post Content */}
      <p className="text-gray-300 mb-4 line-clamp-3">{post.content}</p>

      {/* Buttons Row */}
      <div className="flex justify-between items-center">
        {/* View More */}
        <Link
          to={`/post/${post._id}`}
          className="text-neon-pink hover:underline font-semibold"
        >
          Read more →
        </Link>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {/* ✏️ Edit Button (same design as delete) */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{
              scale: 0.9,
              transition: { duration: 0.001 },
              backgroundColor: "#ca8a04", // darker shade on tap
              boxShadow: "0 0 10px #facc15", // glowing yellow
            }}
            type="button"
            className="bg-yellow-500 text-white p-2 rounded-md transition-all shadow-md"
          >
            <Link to={`/edit/${post._id}`}>
              <Pencil size={18} />
            </Link>
          </motion.button>

          {/* 🗑 Delete Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{
              scale: 0.9,
              transition: { duration: 0.001 },
              backgroundColor: "#b91c1c",
              boxShadow: "0 0 10px #ef4444",
            }}
            type="button"
            onClick={() => onDelete(post._id)}
            className="bg-red-500 text-white p-2 rounded-md transition-all shadow-md"
          >
            <Trash size={18} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

export default PostCard;
