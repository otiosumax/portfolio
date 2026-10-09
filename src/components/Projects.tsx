import { lazy, Suspense, useEffect, useState } from "react";
import type { Project } from "../types/Project";
import { ThreeDot } from "react-loading-indicators";

const ProjectCard = lazy(() => import("./ProjectCard"));

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
      <div className="headline">
        <p>( Избранные работы )</p>
        <div className="title-and-text">
          <h2>Штуки, которыми я горжусь</h2>
          <p className="scribble">сделано с любовью &lt;3</p>
        </div>
      </div>
      <Suspense
        fallback={
          <ThreeDot
            variant="brick-stack"
            color="#ffd928"
            size="large"
          ></ThreeDot>
        }
      >
        <ProjectCard />
        {projects.map((project) => {
          return <ProjectCard project={project} />;
        })}
      </Suspense>
    </section>
  );
}

export default Projects;
