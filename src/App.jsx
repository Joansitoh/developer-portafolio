import Header from "./components/Header";
import { useState } from "react";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);
  return (
    <>
      <Header />
    </>
  );
}

export default App;
