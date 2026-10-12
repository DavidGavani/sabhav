import { useCallback, useState } from "react";
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import Collections from "./components/Collections";
import Lookbook from "./components/Lookbook";
import Process from "./components/Process";
import About from "./components/About";
import Contact from "./components/Contact";
import Footer from "./components/Footer";

export default function App() {
  const [filter, setFilter] = useState("all");
  const select = useCallback((slug: string) => setFilter(slug), []);

  return (
    <>
      <Nav />
      <main>
        <Hero onSelect={select} />
        <Collections onSelect={select} />
        <Lookbook filter={filter} onFilter={setFilter} />
        <Process />
        <About />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
