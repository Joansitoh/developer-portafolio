// IMPORTED COMPONENTS
import { FaGithub, FaForward } from "react-icons/fa";
import { motion } from "framer-motion";

// CUSTOM COMPONENTS
import Title from "../utils/Title";
import Reveal from "../utils/Reveal";
import Configuration from "../utils/Config";
import RevealContainer from "../utils/RevealContainer";

import React, { useEffect, useState } from "react";
import axios from "axios";

const Project = ({ title, description, technologies, sourceLink, link }) => {
  const theme = Configuration.get("theme");
  const openLink = ({ source }) => {
    window.open(source ? sourceLink : link);
  };

  const [screenshot, setScreenshot] = useState(null);

  useEffect(() => {
    const screenshotUrl = `http://localhost:3000/screenshot?url=${link}`;
    setScreenshot(screenshotUrl);
  }, [link]);

  return (
    <RevealContainer>
      <motion.div className="flex flex-col gap-2 max-w-sm">
        <Reveal>
          <div className="bg-zinc-700 bg-opacity-85 h-44 rounded flex flex-col justify-end items-center">
            <div
              className="h-36 w-4/5 bg-white rounded"
              style={{
                backgroundImage: `url(${screenshot})`,
                backgroundSize: "cover",
              }}
            >
              {screenshot == null && (
                <div className="flex h-full w-full justify-center items-center">
                  <p className="text-black">LOADING</p>
                </div>
              )}
            </div>
          </div>
        </Reveal>
        <Reveal>
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
        </Reveal>
        <Reveal>
          <div
            className="flex gap-1 items-center font-bold"
            style={{ color: theme.textColor }}
          >
            {technologies.map((technology, index) => (
              <span key={index}>
                <p className="text-sm inline">{technology}</p>
                {index !== technologies.length - 1 && <span> - </span>}
              </span>
            ))}
          </div>
        </Reveal>
        <Reveal>
          <p className="font-light text-sm">
            {description.length > 120
              ? description.substring(0, 120) + "..."
              : description}

            <a href="#" className="ml-2" style={{ color: theme.textColor }}>
              Learn more{" "}
            </a>
          </p>
        </Reveal>
      </motion.div>
    </RevealContainer>
  );
};

export default function Proyects() {
  return (
    <div className="flex flex-col p-5 gap-3 max-w-3xl">
      <Title title="Proyects" />
      <div className="grid md:grid-cols-2 grid-cols-1 gap-5 justify-items-center items-center">
        {Configuration.getAll().projects.map((project, index) => (
          <Project
            title={project.title}
            description={project.description}
            technologies={project.technologies}
            link={project.url}
          />
        ))}
      </div>
    </div>
  );
}
