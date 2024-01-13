import React, { useEffect, useState } from "react";
import { FaGithub, FaLinkedin, FaTwitter } from "react-icons/fa";
import { motion } from "framer-motion";

const Link = ({ children, delay = 0.2, url = "" }) => {
  const handleClick = () => {
    if (url) window.open(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: delay }}
      onClick={handleClick}
      className="cursor-pointer"
    >
      {children}
    </motion.div>
  );
};

export default function Navbar() {
  return (
    <div className="flex p-5 gap-2 w-full justify-between">
      <div className="flex gap-2">
        <Link url="https://www.linkedin.com/in/joansiitoh/">
          <FaLinkedin size={20} />
        </Link>
        <Link delay={0.4} url="https://github.com/Joansitoh">
          <FaGithub size={20} />
        </Link>
        <Link delay={0.6} url="https://twitter.com/joansiitohtv">
          <FaTwitter size={20} />
        </Link>
      </div>
      <Link>
        <div className="w-36 h-10 rounded border-green-500 border items-center justify-center flex shadow-md">
          <p className="text-center text-green-500">Bitanetic</p>
        </div>
      </Link>
    </div>
  );
}
