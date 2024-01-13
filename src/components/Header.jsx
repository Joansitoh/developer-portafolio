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
    <div className="flex flex-col p-5 gap-3 max-w-3xl">
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
              Hello! I'm Joansiitoh, I've been programming for about 5 years on
              Minecraft and other projects for Linux! I'm a Full Stack Developer
              and I'm currently working on a project called{" "}
              <a href="bitanetic.com">Bitanetic</a>! I'm also a System
              Administrator and I've been working for 2 years on Linux servers!
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
