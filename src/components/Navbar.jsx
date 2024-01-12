import React, { useEffect, useState } from "react";
import { FaGithub, FaLinkedin, FaTwitter } from "react-icons/fa";
import { motion } from "framer-motion";

export default function Navbar() {
  return (
    <div className="flex p-5 gap-2 w-full justify-between">
      <div className="flex gap-2">
        <FaLinkedin />
        <FaGithub />
        <FaTwitter />
      </div>
      <div className="w-36 h-10 rounded border-green-500 border items-center justify-center flex shadow-md">
        <p className="text-center text-green-500">My Proyect</p>
      </div>
    </div>
  );
}
