// import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./index.css";
import { Home } from "./layout/Home";
// import CreateNew from "./layout/CreateNew";
import Header from "./layout/Header";
import LeftBar from "./layout/LeftBar";
import { useEffect, useRef, useState } from "react";
import Footer from "./layout/Footer";
import { ToastContainer } from "react-toastify";
import { Construct } from "./construct";
import "@maxgraph/core/css/common.css";

export default function Main() {
  const [filename, setFilename] = useState("");
  function handleFilename(filename: string) {
    setFilename(filename);
  }
  const constructRef = useRef<Construct | null>(null);
  useEffect(() => {
    if (constructRef.current === null) {
      constructRef.current = new Construct();
    }
  }, []);
  if (filename == "a") {
    return <Home OnFilename={handleFilename} constructRef={constructRef} />;
  } else {
    return (
      <>
        <ToastContainer />
        <Header
          constructRef={constructRef}
          filename={filename}
          OnFilename={handleFilename}
        />
        <LeftBar constructRef={constructRef} />
        <Footer constructRef={constructRef} />
      </>
    );
  }

  // <Router>
  //   <Routes>
  //     <Route path="/" element={<Home />}></Route>
  //     <Route path="/create-new-diagram" element={<CreateNew />}></Route>
  //     <Route path="/open-new-diagram" element={<CreateNew />}></Route>
  //   </Routes>
  // </Router>
}
