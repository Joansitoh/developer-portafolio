import React, { useEffect, useState } from "react";
import Title from "./objets/Title";

export default function Proyects() {
  return (
    <div className="flex flex-col p-5 gap-3 max-w-2xl">
      <Title title="Proyects" />
      <p className="font-light text-base">
        Hello! I'm Joan, a 15 year old developer from the Philippines. I'm a
        full stack developer, system administrator, and Minecraft plugin
        developer. I'm currently working on <a href="">Minecraft Philippines</a>{" "}
        and <a href="">Minecraft Philippines Network</a>.
      </p>
      <button className="bg-green-400 hover:bg-green-600 text-black font-bold py-2 px-4 rounded w-48">
        Contact Me
      </button>
    </div>
  );
}
