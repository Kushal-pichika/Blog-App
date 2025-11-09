import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import Header from "./components/Header";
import Home from "./pages/Home";
import AddPost from "./pages/AddPost";
import ViewPost from "./pages/ViewPost";
import EditPost from "./pages/EditPost";
import { motion } from "framer-motion";

function App() {
  return (
    <>
    <Router>
      <div className="min-h-screen flex flex-col relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-950 to-black">
        <Header />

        <main className="flex-grow container mx-auto px-4 py-10 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/add" element={<AddPost />} />
              <Route path="/post/:id" element={<ViewPost />} />
              <Route path="/edit/:id" element={<EditPost />} />
            </Routes>
          </motion.div>
        </main>
      </div>
    </Router>
    <Toaster position="bottom-right" />
    </>
  );
}

export default App;
