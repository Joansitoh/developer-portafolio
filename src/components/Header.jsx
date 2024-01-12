import React, { useEffect, useState } from "react";
import Typewriter from "typewriter-effect/dist/core";

import RevealContainer from "./objets/RevealContainer";
import Reveal from "./objets/Reveal";

export default function Header() {
  useEffect(() => {
    new Typewriter("#typewriter", {
      strings: [
        "Full Stack Developer",
        "Minecraft Developer",
        "System Administrator",
      ],
      autoStart: true,
      loop: true,
      cursor: "",
      delay: 75,
      deleteSpeed: 50,
    });
  }, []);

  return (
    <div className="flex flex-col p-5 gap-3 max-w-2xl">
      <RevealContainer>
        <Reveal
          children={
            <p className="font-extrabold text-6xl">
              Hey, I'm Joan<span className="text-green-400">.</span>
            </p>
          }
        />
        <Reveal
          children={
            <p className="font-normal text-2xl">
              I'm a{" "}
              <span
                className="font-extrabold text-green-500"
                id="typewriter"
              ></span>
            </p>
          }
        />
        <Reveal
          children={
            <p className="font-light text-base">
              Hello! I'm Joan, a 15 year old developer from the Philippines. I'm
              a full stack developer, system administrator, and Minecraft plugin
              developer. I'm currently working on{" "}
              <a href="">Minecraft Philippines</a> and{" "}
              <a href="">Minecraft Philippines Network</a>.
            </p>
          }
        />
        <Reveal
          children={
            <button className="bg-green-400 hover:bg-green-600 text-black font-bold py-2 px-4 rounded w-48">
              Contact Me
            </button>
          }
        />
      </RevealContainer>
    </div>
  );
}
