import React, { useEffect, useState } from "react";
import Title from "./objets/Title";

import RevealContainer from "./objets/RevealContainer";
import Reveal from "./objets/Reveal";

export default function About() {
  const technologiesWorked = [
    "PostgreSQL",
    "MySQL",
    "Linux",
    "Nginx",
    "Apache",
    "PHP",
    "XML",
    "HTML",
    "CSS",
    "JavaScript",
    "Python",
  ];

  const technologiesUsed = [
    "Spigot",
    "Spigot NMS",
    "Lua",
    "Java",
    "NodeJS",
    "React",
    "TailwindCSS",
    "MongoDB",
    "Redis",
    "Docker",
  ];

  return (
    <div className="flex flex-col p-5 gap-3 max-w-3xl">
      <RevealContainer>
        <Reveal>
          <Title title="About" left={false} />
        </Reveal>
        <div className="flex gap-9">
          <div className="flex-1">
            <Reveal>
              <p className="font-light text-base">
                Hello! I'm Joan, a 15 year old developer from the Philippines.
                I'm a full stack developer, system administrator, and Minecraft
                plugin developer. I'm currently working on{" "}
                <a href="">Minecraft Philippines</a> and{" "}
                <a href="">Minecraft Philippines Network</a>.
              </p>
            </Reveal>
          </div>
          <div className="flex-1 flex flex-col gap-5">
            <div className="flex flex-col gap-5 mb-5">
              <Reveal>
                <div className="flex gap-2 items-center">
                  <div className="w-5 h-5 bg-green-500 rounded" />
                  <p className="font-bold text-xl">Learn at work or study</p>
                </div>
              </Reveal>
              <Reveal>
                <div className="flex flex-wrap gap-2">
                  {technologiesWorked.map((technology) => (
                    <div className="sidebar rounded-2xl p-1 items-center text-center px-2 py-1 my-1">
                      <p className="font-light text-sm">{technology}</p>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>
            <div className="flex flex-col gap-5">
              <Reveal>
                <div className="flex gap-2 items-center">
                  <div className="w-5 h-5 bg-green-500 rounded" />
                  <p className="font-bold text-xl">Use for fun</p>
                </div>
              </Reveal>
              <Reveal>
                <div className="flex flex-wrap gap-2">
                  {technologiesUsed.map((technology) => (
                    <div className="sidebar rounded-2xl p-1 items-center text-center px-2 py-1 my-1">
                      <p className="font-light text-sm">{technology}</p>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </RevealContainer>
    </div>
  );
}
