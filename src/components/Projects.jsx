import React, { useEffect, useState } from "react";
import { FaGithub, FaForward } from "react-icons/fa";
import Title from "./objets/Title";
import { motion } from "framer-motion";

const Project = ({ title, description, technologies, sourceLink, link }) => {
  const openLink = ({ source }) => {
    window.open(source ? sourceLink : link);
  };

  return (
    <motion.div
      className="flex flex-col gap-2"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 1 }}
      /* initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 1 }} */
    >
      <div className="bg-gray-800 bg-opacity-85 h-44 rounded flex flex-col justify-end items-center">
        <div className="h-36 w-4/5 bg-white rounded"></div>
      </div>
      <div className="flex gap-3 items-center">
        <p className="font-extrabold text-base">{title}</p>
        <div className="h-1 w-full sidebar" />
        <FaGithub
          size={30}
          className="cursor-pointer"
          onClick={() => openLink({ source: true })}
        />
        <FaForward
          size={30}
          className="cursor-pointer"
          onClick={() => openLink({ source: false })}
        />
      </div>
      <div className="flex gap-1 items-center text-green-500 font-bold">
        {technologies.map((technology, index) => (
          <span key={index}>
            <p className="text-sm inline">{technology}</p>
            {index !== technologies.length - 1 && <span> - </span>}
          </span>
        ))}
      </div>
      <p className="font-light text-sm">
        {description.length > 120
          ? description.substring(0, 120) + "..."
          : description}

        <a href="#" className="ml-2 text-green-500">
          Learn more{" "}
        </a>
      </p>
    </motion.div>
  );
};

export default function Proyects() {
  return (
    <div className="flex flex-col p-5 gap-3 max-w-2xl">
      <Title title="Proyects" />
      <div className="grid grid-cols-2 gap-5">
        <Project
          title={"ufw_manager_gui"}
          description={
            "UFW GUI Manager is a Python application that allows you to manage UFW (Uncomplicated Firewall) ports on a remote machine via SSH. The application features a simple and user-friendly graphical interface. I'm new to this so don't kill me either."
          }
          technologies={["Python", "PyQT5", "Paramiko"]}
          link={"https://google.com"}
        />
      </div>
    </div>
  );
}
