import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function Sidebar() {
  return (
    <div className="fixed top-0 left-0 flex flex-col p-5 gap-8 h-full w-12 justify-start items-center sidebar">
      <div className="bg-gray-800 w-8 h-8"></div>
      <p
        style={{ writingMode: "vertical-rl" }}
        className="font-light cursor-pointer"
      >
        About
      </p>
      <p
        style={{ writingMode: "vertical-rl" }}
        className="font-light cursor-pointer"
      >
        Projects
      </p>
      <p
        style={{ writingMode: "vertical-rl" }}
        className="font-light cursor-pointer"
      >
        Contact
      </p>
    </div>
  );
}
