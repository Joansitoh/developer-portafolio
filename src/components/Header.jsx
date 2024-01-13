// REACT COMPONENTS
import React, { useEffect } from "react";
import Typewriter from "typewriter-effect/dist/core";

// CUSTOM COMPONENTS
import RevealContainer from "../utils/RevealContainer";
import Reveal from "../utils/Reveal";
import Configuration from "../utils/Config";

export default function Header() {
  useEffect(() => {
    new Typewriter("#typewriter", {
      strings: Configuration.get("header.works"),
      autoStart: true,
      loop: true,
      cursor: "",
      delay: 75,
      deleteSpeed: 50,
    });
  }, []);

  return (
    <div className="flex flex-col p-5 gap-3 pt-20">
      <RevealContainer>
        <Reveal>
          <p className="font-extrabold text-6xl">
            Hey, I'm {Configuration.get("header.name")}
            <span className={Configuration.get("theme.textColor")}>.</span>
          </p>
        </Reveal>
        <Reveal>
          <p className="font-normal text-2xl">
            I'm a{" "}
            <span
              className={
                "font-extrabold " + Configuration.get("theme.textColor")
              }
              id="typewriter"
            ></span>
          </p>
        </Reveal>
        <Reveal>
          <p className="font-light text-base">
            {Configuration.get("header.description")}
          </p>
        </Reveal>
        <Reveal>
          <button
            className={
              "text-black font-bold py-2 px-4 rounded w-48 " +
              Configuration.get("theme.bgColor")
            }
          >
            Contact Me
          </button>
        </Reveal>
      </RevealContainer>
    </div>
  );
}
