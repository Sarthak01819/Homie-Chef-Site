const Loader = ({ text = "Loading..." }) => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
      <div className="h-10 w-10 border-4 border-gray-300 border-t-black rounded-full animate-spin"></div>
      <p className="text-sm text-gray-500">{text}</p>
    </div>
  );
};

export default Loader;
