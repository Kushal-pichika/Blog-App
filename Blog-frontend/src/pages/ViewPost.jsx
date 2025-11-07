import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";


function ViewPost() {
  const { id } = useParams();
  const [post, setPost] = useState(null);

  useEffect(() => {
    fetch(`http://blog-backend:5000/api/posts/${id}`)
      .then((res) => res.json())
      .then((data) => setPost(data))
      .catch((err) => console.error("Error fetching post:", err));
  }, [id]);

  if (!post)
    return (
      <p className="text-gray-400 text-center mt-20">
        Loading post details...
      </p>
    );

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="max-w-3xl mx-auto mt-10 glass p-10 rounded-2xl shadow-2xl"
    >
      <Link
        to="/"
        className="text-neon-pink hover:underline flex items-center gap-1 mb-6"
      >
        <ArrowLeft size={18} /> Back
      </Link>

      <h1 className="text-4xl font-futuristic text-neon-blue mb-6 neon-text">
        {post.title}
      </h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 1 }}
        className="text-gray-200 leading-relaxed text-lg"
      >
        {post.content}
      </motion.p>
    </motion.div>
  );
}

export default ViewPost;
