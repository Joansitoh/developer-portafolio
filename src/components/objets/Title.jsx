const Title = ({ title, left = true }) => {
  return (
    <div className="flex gap-5 items-center">
      {left ? (
        <>
          <div className="h-1 w-full sidebar" />
          <p className="font-extrabold text-6xl">
            {title}
            <span className="text-green-400">.</span>
          </p>
        </>
      ) : (
        <>
          <p className="font-extrabold text-6xl">
            {title}
            <span className="text-green-400">.</span>
          </p>
          <div className="h-1 w-full sidebar" />
        </>
      )}
    </div>
  );
};

export default Title;
