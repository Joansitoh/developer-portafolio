// REACT COMPONENTS
import React from "react";
import ReactDOM from "react-dom/client";
import { useState } from "react";

// IMPORTED COMPONENTS
import { motion } from "framer-motion";

// CUSTOM COMPONENTS
import Header from "./components/Header";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";

// STYLES
import "./App.css";

function App() {
  return (
    <>
      <Sidebar />
      <div className="ml-12">
        <Navbar />
        <div className="flex flex-col items-center justify-center max-w-7xl">
          <div className="my-40 w-2/3">
            <Header />
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
