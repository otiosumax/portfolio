import "./styles/Homepage.css";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Projects from "./components/Projects";

function Homepage() {
  return (
    <div className="homepage">
      <Header />
      <Hero />
      <h4>Здеся будет бегущая строка</h4>
      <Projects />
    </div>
  );
}

export default Homepage;
