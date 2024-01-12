const Title = ({ title }) => {
  return (
    <div className="flex gap-5 items-center">
      <p className="font-extrabold text-6xl">
        {title}
        <span className="text-green-400">.</span>
      </p>
      <div className="h-1 w-full sidebar" />
    </div>
  );
};

export default Title;
