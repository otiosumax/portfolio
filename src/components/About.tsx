import AboutChip from "./AboutChip";

function About() {
  const skills = [
    'skill',
    'skill',
    'skill',
    'skill',
    'skill',
    'skill',
    'skill',
    'skill',
    'skill',
   ];

  return (
    // TODO: написать текстики
    <section className="about" id="about">
      <div className="about-title">
        <p>( За кулисами )</p>
        <h2>Здесь заголовок о мне великом</h2>
      </div>
      <div className="about-content">
        <p>здесь будет что-то про меня</p>
        <div className="skills">
          {skills.map((tag) => (
            <AboutChip>{tag}</AboutChip>
          ))}
        </div>
      </div>
    </section>
  );
}

export default About;
