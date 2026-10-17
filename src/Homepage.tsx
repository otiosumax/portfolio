import "./styles/Homepage.css";

import Header from "./components/Header";
import Hero from "./components/Hero";
import Projects from "./components/Projects";
import About from "./components/About";
import Contact from "./components/Contact";
import Marquee from "./components/Marquee";

import info from "./info.json";

function Homepage() {
  return (
    <div className="homepage">
      <Header />
      <Hero heroText={info.heroText} />
      <Marquee marqueeItems={info.marqueLines} />
      <Projects />
      <About aboutInfo={info.about} skills={info.skills} />
      <Contact email={info.email} links={info.links} />
    </div>
  );
}

export default Homepage;
