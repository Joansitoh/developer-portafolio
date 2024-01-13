import Configuration from "../utils/Config";

const Title = ({ title, left = true }) => {
  const theme = Configuration.get("theme");
  return (
    <div className="flex gap-5 items-center">
      {left ? (
        <>
          <div className="h-1 w-full sidebar" />
          <p className="font-extrabold text-6xl">
            {title}
            <span style={{ color: theme.textColor }}>.</span>
          </p>
        </>
      ) : (
        <>
          <p className="font-extrabold text-6xl">
            {title}
            <span style={{ color: theme.textColor }}>.</span>
          </p>
          <div className="h-1 w-full sidebar" />
        </>
      )}
    </div>
  );
};

export default Title;
