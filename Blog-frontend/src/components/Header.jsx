import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { PenTool, Home, Plus } from "lucide-react";

function Header() {
  return (
    <motion.header
      initial={{ y: -60 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 70 }}
      className="glass sticky top-0 z-50 shadow-lg"
    >
      <nav className="flex justify-between items-center py-4 px-8 text-white">
        <Link to="/" className="font-futuristic text-2xl neon-text flex items-center gap-2">
          <PenTool className="text-neon-blue" /> FutureBlog
        </Link>
        <div className="flex gap-6 font-modern">
          <Link to="/" className="hover:text-neon-pink flex items-center gap-1">
            <Home size={18} /> Home
          </Link>
          <Link to="/add" className="hover:text-neon-blue flex items-center gap-1">
            <Plus size={18} /> Add Post
          </Link>
        </div>
      </nav>
    </motion.header>
  );
}

export default Header;
