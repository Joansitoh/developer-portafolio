import { motion } from "framer-motion";
import { useEffect, useState } from "react";

import Configuration from "../utils/Config";

const Link = ({ children, delay = 0.2, step = 0, className = {} }) => {
  const handleClick = () => {
    const element = document.getElementById("container");
    element.scrollTo({
      top: step * window.innerHeight,
      behavior: "smooth",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, delay: delay }}
      onClick={handleClick}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default function Sidebar() {
  const [userAvatar, setUserAvatar] = useState(null);
  const githubUrl = Configuration.get("navbar.github");

  useEffect(() => {
    const getUsernameFromUrl = (url) => {
      const usernameMatch = url.match(/github\.com\/([^\/]+)/);
      return usernameMatch ? usernameMatch[1] : null;
    };

    const fetchUserIdAndAvatar = async () => {
      const username = getUsernameFromUrl(githubUrl);

      if (username) {
        try {
          const response = await fetch(
            `https://api.github.com/users/${username}`
          );
          const userData = await response.json();

          setUserAvatar(userData.avatar_url);
        } catch (error) {
          console.error("Error fetching user information:", error);
        }
      }
    };

    fetchUserIdAndAvatar();
  }, [githubUrl]);

  return (
    <div className="fixed top-0 left-0 flex flex-col p-5 gap-8 h-full w-12 justify-start items-center sidebar">
      <Link>
        <div className="rounded bg-gray-800 w-8 h-8 cursor-pointer">
          <img src={userAvatar} className="rounded w-full h-full" />
        </div>
      </Link>
      <Link delay={0.4} step={1}>
        <p
          style={{ writingMode: "vertical-rl" }}
          className="font-light cursor-pointer"
        >
          About
        </p>
      </Link>
      <Link delay={0.6} step={2}>
        <p
          style={{ writingMode: "vertical-rl" }}
          className="font-light cursor-pointer"
        >
          Projects
        </p>
      </Link>
      <Link delay={0.8} step={3}>
        <p
          style={{ writingMode: "vertical-rl" }}
          className="font-light cursor-pointer"
        >
          Contact
        </p>
      </Link>
    </div>
  );
}
