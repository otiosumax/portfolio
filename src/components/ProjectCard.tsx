import type { Project } from "../types/Project";

function ProjectCard({
  project = {
    title: "blank_project",
    imageURL: "/stones.jpg",
    id: `${(Math.random() * 1e10).toFixed(0)}`,
    tags: ["blank", "project"],
    description: "description",
    githubLink: "",
  },
}: {
  project?: Project;
}) {
  return (
    <div className="project-card">
      <img alt={`screenshot of ${project.title}`} src={project.imageURL} />
      <div className="project-card-text">
        <div className="project-card-title-and-tags">
          <h3>{project.title}</h3>
          <p>
            {project.tags.map((tag, index, array) => {
              return (
                <span key={index}>
                  {tag}
                  {index < array.length - 1 ? " • " : ""}
                </span>
              );
            })}
          </p>
        </div>
        <p>{project.description}</p>
        <a href={project.githubLink}>
          <img src="arrow.svg" />
        </a>
      </div>
      <hr />
    </div>
  );
}

export default ProjectCard;
