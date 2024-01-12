import { motion } from "framer-motion";

// CUSTOM COMPONENTS
import Header from "./components/Header";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import About from "./components/About";
import Proyects from "./components/Projects";

// STYLES
import "./App.css";

const Page = ({ children }) => {
  return (
    <div className="flex flex-col items-center max-w-7xl h-screen scroll-snap-start">
      {children}
    </div>
  );
};

function App() {
  return (
    <>
      <Sidebar />
      <div className="ml-12 h-screen overflow-auto scroll-snap-y mandatory">
        <div className="sticky top-0 z-50">
          <Navbar />
        </div>
        <Page>
          <div className="pt-20">
            <Header />
          </div>
        </Page>
        <Page>
          <About />
        </Page>
        <Page>
          <Proyects />
        </Page>
        {/* Add more pages here */}
      </div>
    </>
  );
}

export default App;
