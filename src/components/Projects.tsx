import { useEffect, useState } from "react";
import ProjectCard from "./ProjectCard";
import type { Project } from "../types/Project";

function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const controller = new AbortController();

    const loadProjects = () => {
      fetch(
        `${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_API_ROUTE}`,
        {
          signal: controller.signal,
        },
      )
        .then((response) => {
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          return response.json() as Promise<Project[]>;
        })
        .then((data) => {
          setProjects(data);
          console.log(projects);
        })
        .catch((error: unknown) => {
          if (error instanceof Error && error.name === "AbortError") return;
          console.error("Не удалось загрузить данные о проектах:", error);
        });
    };

    loadProjects();
    const intervalId = setInterval(loadProjects, 5000);

    return () => {
      clearInterval(intervalId);
      controller.abort();
    };
  }, []);

  return (
    <section id="projects" className="projects">
      <div className="">
        {projects.map((project) => {
          return ProjectCard(project);
        })}
      </div>
    </section>
  );
}

export default Projects;
