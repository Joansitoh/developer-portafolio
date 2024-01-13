import Configuration from "../utils/Config";

const Title = ({ title, left = true }) => {
  return (
    <div className="flex gap-5 items-center">
      {left ? (
        <>
          <div className="h-1 w-full sidebar" />
          <p className="font-extrabold text-6xl">
            {title}
            <span className={Configuration.get("theme.textColor")}>.</span>
          </p>
        </>
      ) : (
        <>
          <p className="font-extrabold text-6xl">
            {title}
            <span className={Configuration.get("theme.textColor")}>.</span>
          </p>
          <div className="h-1 w-full sidebar" />
        </>
      )}
    </div>
  );
};

export default Title;
