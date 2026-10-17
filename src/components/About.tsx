import AboutChip from "./AboutChip";

function About({
  aboutInfo = { title: "title", description: "desc" },
  skills = [],
}: {
  aboutInfo?: { title: string; description: string };
  skills?: string[];
}) {

  return (
    // TODO: написать текстики
    <section className="about" id="about">
      <div className="about-title">
        <p>( За кулисами )</p>
        <h2>{aboutInfo.title}</h2>
      </div>
      <div className="about-content">
        <p>{aboutInfo.description}</p>
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
