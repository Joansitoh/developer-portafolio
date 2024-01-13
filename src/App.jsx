// CUSTOM COMPONENTS
import Header from "./components/Header";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import About from "./components/About";
import Proyects from "./components/Projects";
import Configuration from "./utils/Config";

// STYLES
import "./App.css";

const Page = ({ children }) => {
  return (
    <div className="flex flex-col justify-start max-w-3xl w-full h-screen scroll-snap-start">
      {children}
    </div>
  );
};

function App() {
  const position = Configuration.get("theme.side");
  const positions = {
    left: "items-start",
    right: "items-end",
    center: "items-center",
  };

  return (
    <>
      <Sidebar />
      <div
        className="ml-12 h-screen overflow-auto scroll-snap-y mandatory"
        id="container"
      >
        <div className="sticky top-0 z-50">
          <Navbar />
        </div>
        {/* <div className={"items-center flex flex-col " + positions[position]}> */}
        <div
          className={
            "px-20 flex flex-col justify-center " + positions[position]
          }
        >
          <Page>
            <Header />
          </Page>
          <Page>
            <About />
          </Page>
          <Page>
            <Proyects />
          </Page>
        </div>
      </div>
    </>
  );
}

export default App;
