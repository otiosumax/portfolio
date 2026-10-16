import "./styles/Homepage.css";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Projects from "./components/Projects";
import About from "./components/About";

function Homepage() {
  return (
    <div className="homepage">
      <Header />
      <Hero />
      <h4>Здеся будет бегущая строка</h4>
      <Projects />
      <About />
    </div>
  );
}

export default Homepage;
