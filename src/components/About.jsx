// REACT COMPONENTS

// CUSTOM COMPONENTS
import RevealContainer from "../utils/RevealContainer";
import Reveal from "../utils/Reveal";
import Title from "../utils/Title";
import Configuration from "../utils/Config";

export default function About() {
  const theme = Configuration.get("theme");
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
                {Configuration.get("about.description")}
              </p>
            </Reveal>
          </div>
          <div className="flex-1 flex flex-col gap-5">
            <div className="flex flex-col gap-5 mb-5">
              <Reveal>
                <div className="flex gap-2 items-center">
                  <div
                    className="w-5 h-5 rounded"
                    style={{ backgroundColor: theme.bgColor }}
                  />
                  <p className="font-bold text-xl">Learn at work or study</p>
                </div>
              </Reveal>
              <Reveal>
                <div className="flex flex-wrap gap-2">
                  {Configuration.getAll().about.techWork.map((tech) => (
                    <div className="sidebar rounded-2xl p-1 items-center text-center px-2 py-1 my-1">
                      <p className="font-light text-sm">{tech}</p>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>
            <div className="flex flex-col gap-5">
              <Reveal>
                <div className="flex gap-2 items-center">
                  <div
                    className="w-5 h-5 rounded"
                    style={{ backgroundColor: theme.bgColor }}
                  />
                  <p className="font-bold text-xl">Use for fun</p>
                </div>
              </Reveal>
              <Reveal>
                <div className="flex flex-wrap gap-2">
                  {Configuration.getAll().about.techFun.map((tech) => (
                    <div className="sidebar rounded-2xl p-1 items-center text-center px-2 py-1 my-1">
                      <p className="font-light text-sm">{tech}</p>
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
