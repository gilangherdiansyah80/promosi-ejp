const Alert = ({ message }) => {
  return (
    <main className="flex p-3 rounded-xl w-1/5 h-30 flex-col items-center justify-center bg-[#f6df3c]">
      <h1 className="text-black">{message}</h1>
    </main>
  );
};

export default Alert;
