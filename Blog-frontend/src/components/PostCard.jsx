import React from "react";
import { motion } from "framer-motion";
import { Trash } from "lucide-react";
import { Link } from "react-router-dom";

function PostCard({ post, onDelete }) {

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 200 }}
      className="glass p-6 rounded-xl shadow-xl cursor-pointer border border-gray-700 hover:border-neon-blue"
    >
      <h2 className="text-xl font-semibold text-neon-blue mb-2">
        {post.title}
      </h2>
      <p className="text-gray-300 mb-4 line-clamp-3">{post.content}</p>
      <div className="flex justify-between items-center">
        <Link
          to={`/post/${post._id}`}
          className="text-neon-pink hover:underline font-semibold"
        >
          Read more →
        </Link>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{
            scale: 0.9,
            transition: { duration: 0.001 },
            backgroundColor: "#b91c1c",
            boxShadow: "0 0 10px #ef4444",
          }}
          type="button"
          onClick={()=> onDelete(post._id)}
          className="bg-red-500 text-white p-2 rounded-md transition-all shadow-md"
        >
          <Trash size={18} />
        </motion.button>
      </div>
    </motion.div>
  );
}

export default PostCard;
