
import { lazy, Suspense, useEffect, useState } from "react";
import type { Project } from "../types/Project";
import { ThreeDot } from "react-loading-indicators";

const ProjectCard = lazy(() => import("./ProjectCard"));

type ProjectChange =
  | { type: "upsert"; project: Project }
  | { type: "delete"; id: string };

function applyProjectChange(
  current: Project[],
  change: ProjectChange,
): Project[] {
  if (change.type === "delete") {
    return current.filter((project) => project.id !== change.id);
  }

  const exists = current.some(
    (project) => project.id === change.project.id,
  );

  return exists
    ? current.map((project) =>
        project.id === change.project.id ? change.project : project,
      )
    : [...current, change.project];
}

function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const controller = new AbortController();

    const baseUrl = (
      import.meta.env.VITE_API_BASE_URL ?? ""
    ).replace(/\/+$/, "");

    const projectsRoute =
      import.meta.env.VITE_API_ROUTE ?? "/projects";

    const eventsRoute =
      import.meta.env.VITE_API_EVENTS_ROUTE ?? "/events";

    // Корректно объединяем базовый URL и маршрут.
    const apiUrl = (route: string) =>
      `${baseUrl}/${route.replace(/^\/+/, "")}`;

    let initialFetchStarted = false;
    let initialLoaded = false;

    // События, полученные, пока загружается начальный список.
    const pendingChanges: ProjectChange[] = [];

    const applyOrQueue = (change: ProjectChange) => {
      if (!initialLoaded) {
        pendingChanges.push(change);
        return;
      }

      setProjects((current) => applyProjectChange(current, change));
    };

    const onProjectUpsert: EventListener = (event) => {
      try {
        const project = JSON.parse(
          (event as MessageEvent<string>).data,
        ) as Project;

        if (!project || typeof project.id !== "string") {
          throw new Error("Некорректные данные проекта");
        }

        applyOrQueue({ type: "upsert", project });
      } catch (error) {
        console.error("Ошибка обработки SSE проекта:", error);
      }
    };

    const onProjectDeleted: EventListener = (event) => {
      try {
        const data = JSON.parse(
          (event as MessageEvent<string>).data,
        ) as { id?: unknown };

        if (typeof data.id !== "string") {
          throw new Error("Некорректный id удалённого проекта");
        }

        applyOrQueue({ type: "delete", id: data.id });
      } catch (error) {
        console.error("Ошибка обработки удаления проекта:", error);
      }
    };

    // Подключаем SSE перед начальной загрузкой.
    const eventSource = new EventSource(apiUrl(eventsRoute));

    eventSource.addEventListener("project-created", onProjectUpsert);
    eventSource.addEventListener("project-updated", onProjectUpsert);
    eventSource.addEventListener("project-deleted", onProjectDeleted);

    const loadInitialProjects = () => {
      // Не запускаем GET повторно при переподключении SSE.
      if (initialFetchStarted) return;
      initialFetchStarted = true;

      void fetch(apiUrl(projectsRoute), {
        signal: controller.signal,
      })
        .then(async (response) => {
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }

          const data: unknown = await response.json();

          if (!Array.isArray(data)) {
            throw new Error("Сервер вернул некорректный список проектов");
          }

          return data as Project[];
        })
        .then((initialProjects) => {
          // Применяем изменения, пришедшие во время начального GET.
          const changes = pendingChanges.splice(0);

          initialLoaded = true;

          setProjects(
            changes.reduce(applyProjectChange, initialProjects),
          );
        })
        .catch((error: unknown) => {
          if (error instanceof Error && error.name === "AbortError") {
            return;
          }

          console.error(
            "Не удалось загрузить данные о проектах:",
            error,
          );

          // Если GET завершился ошибкой, продолжаем работать с SSE.
          const changes = pendingChanges.splice(0);

          initialLoaded = true;

          if (changes.length > 0) {
            setProjects((current) =>
              changes.reduce(applyProjectChange, current),
            );
          }
        });
    };

    // Загружаем список после установления SSE-соединения.
    eventSource.addEventListener("open", loadInitialProjects);

    return () => {
      eventSource.removeEventListener("open", loadInitialProjects);
      eventSource.removeEventListener(
        "project-created",
        onProjectUpsert,
      );
      eventSource.removeEventListener(
        "project-updated",
        onProjectUpsert,
      );
      eventSource.removeEventListener(
        "project-deleted",
        onProjectDeleted,
      );

      eventSource.close();
      controller.abort();
    };
  }, []);

  return (
    <section id="projects" className="projects">
      <div className="headline">
        <p>( Избранные работы )</p>
        <div className="title-and-text">
          <h2>То, чем я горжусь</h2>
          <p className="scribble">сделано с любовью &lt;3</p>
        </div>
      </div>

      <Suspense
        fallback={
          <ThreeDot
            variant="brick-stack"
            color="#ffd928"
            size="large"
          />
        }
      >
        <ProjectCard />

        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </Suspense>
    </section>
  );
}

export default Projects;
