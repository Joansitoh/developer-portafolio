// IMPORTED COMPONENTS
import { motion } from "framer-motion";
import { useState } from "react";

// CUSTOM COMPONENTS
import Title from "../utils/Title";
import Reveal from "../utils/Reveal";
import Configuration from "../utils/Config";

export default function Contact() {
  const theme = Configuration.get("theme");
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    window.open(
      `mailto:support@bitanetic.com?subject=${subject}&body=Name: ${name} ${message}`
    );
  };

  return (
    <div className="flex flex-col p-5 gap-3 max-w-3xl">
      <Reveal>
        <Title title="Contact" />
      </Reveal>
      <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
        <div className="flex gap-3 my-5">
          <div className="flex flex-col input-block">
            <input
              className="w-full h-10 rounded border px-3 focus:border-blue-500 focus:outline-none"
              value={name}
              style={{ borderColor: theme.borderColor }}
              onChange={(e) => setName(e.target.value)}
              type="text"
              required
              spellcheck="false"
            />
            <span class="placeholder">Your Name</span>
          </div>

          <div className="flex flex-col input-block">
            <input
              className="w-full h-10 rounded border px-3 focus:border-blue-500 focus:outline-none"
              value={subject}
              style={{ borderColor: theme.borderColor }}
              onChange={(e) => setSubject(e.target.value)}
              type="text"
              required
              spellcheck="false"
            />
            <span class="placeholder">Subject</span>
          </div>
        </div>
        <div className="flex flex-col input-block">
          <textarea
            className="w-full h-40 rounded border px-3 focus:border-blue-500 focus:outline-none"
            style={{ borderColor: theme.borderColor }}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            type="text"
            required
            spellcheck="false"
          />
          <span class="placeholder">Message</span>
        </div>
        <button
          type="submit"
          className="w-full h-10 rounded border px-3"
          style={{ borderColor: theme.borderColor }}
        >
          Send
        </button>
      </form>
    </div>
  );
}
