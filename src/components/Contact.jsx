// IMPORTED COMPONENTS
import { motion } from "framer-motion";
import { useState } from "react";

// CUSTOM COMPONENTS
import Title from "../utils/Title";
import Reveal from "../utils/Reveal";
import RevealContainer from "../utils/RevealContainer";
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
      <RevealContainer>
        <Reveal>
          <Title title="Contact" />
        </Reveal>
        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          <div className="flex gap-3 my-5">
            <Reveal>
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
            </Reveal>

            <Reveal>
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
            </Reveal>
          </div>

          <Reveal>
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
          </Reveal>

          <Reveal>
            <motion.button
              type="submit"
              className="w-full h-10 rounded border px-3"
              style={{ borderColor: theme.borderColor }}
              whileTap={{ scale: 0.96 }}
            >
              Send
            </motion.button>
          </Reveal>
        </form>
      </RevealContainer>
    </div>
  );
}
