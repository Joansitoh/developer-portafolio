import React, { useEffect, useState } from "react";
import Typewriter from "typewriter-effect/dist/core";

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
    <div className="flex flex-col py-24 px-10">
      <p>
        Hey, I'm Joan<span>.</span>
      </p>
      <p className="">
        I'm a <span id="typewriter"></span>
      </p>
    </div>
  );
}
