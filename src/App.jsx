import Header from "./components/Header";
import Navbar from "./components/Navbar";
import { useState } from "react";
import "./App.css";

function App() {
  return (
    <>
      <Navbar />
      <div className="flex flex-col items-center justify-center max-w-7xl">
        <div className="my-40 w-2/3">
          <Header />
        </div>
      </div>
    </>
  );
}

export default App;
