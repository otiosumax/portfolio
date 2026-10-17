import "./styles/Homepage.css";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Projects from "./components/Projects";
import About from "./components/About";
import Contact from "./components/Contact";
import Marquee from "./components/Marquee";

function Homepage() {
  return (
    <div className="homepage">
      <Header />
      <Hero />
      <Marquee />
      <Projects />
      <About />
      <Contact />
    </div>
  );
}

export default Homepage;
