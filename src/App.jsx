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
        <div className="items-center flex flex-col justify-center">
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
