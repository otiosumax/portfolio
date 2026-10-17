import { lazy, Suspense, useEffect, useState } from "react";
import type { Project } from "../types/Project";
import { ThreeDot } from "react-loading-indicators";

const ProjectCard = lazy(() => import("./ProjectCard"));

type ProjectChange =
  { type: "upsert"; project: Project } | { type: "delete"; id: string };

function applyProjectChange(
  current: Project[],
  change: ProjectChange,
): Project[] {
  if (change.type === "delete") {
    return current.filter((project) => project.id !== change.id);
  }

  const exists = current.some((project) => project.id === change.project.id);

  return exists
    ? current.map((project) =>
        project.id === change.project.id ? change.project : project,
      )
    : [...current, change.project];
}

function ProjectsLoader() {
  return (
    <div
      className="projects-loading"
      role="status"
      aria-label="Загружаю проекты"
    >
      <ThreeDot variant="brick-stack" color="#ffd928" size="large" />
    </div>
  );
}

function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    const baseUrl = (import.meta.env.VITE_API_BASE_URL ?? "").replace(
      /\/+$/,
      "",
    );

    const projectsRoute = import.meta.env.VITE_API_ROUTE ?? "/projects";

    const eventsRoute = import.meta.env.VITE_API_EVENTS_ROUTE ?? "/events";

    // Корректно объединяем базовый URL и маршрут.
    const apiUrl = (route: string) => `${baseUrl}/${route.replace(/^\/+/, "")}`;

    // Список ещё не загружен или прямо сейчас перечитывается — события
    // копим и накатываем поверх свежего снимка, чтобы не потерять их.
    let listLoaded = false;
    let listLoading = false;

    // События, полученные, пока читается список.
    const pendingChanges: ProjectChange[] = [];

    const applyOrQueue = (change: ProjectChange) => {
      if (!listLoaded || listLoading) {
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
        const data = JSON.parse((event as MessageEvent<string>).data) as {
          id?: unknown;
        };

        if (typeof data.id !== "string") {
          throw new Error("Некорректный id удалённого проекта");
        }

        applyOrQueue({ type: "delete", id: data.id });
      } catch (error) {
        console.error("Ошибка обработки удаления проекта:", error);
      }
    };

    // Соединение может быть нестабильным — повторяем запросы с этим
    // интервалом.
    const RETRY_DELAY = 3000;

    let listRetryTimer: ReturnType<typeof setTimeout> | undefined;
    let listErrorLogged = false;

    function clearListRetry() {
      if (listRetryTimer !== undefined) {
        clearTimeout(listRetryTimer);
        listRetryTimer = undefined;
      }
    }

    function scheduleListRetry() {
      if (listRetryTimer !== undefined) return;

      listRetryTimer = setTimeout(() => {
        listRetryTimer = undefined;
        loadProjects();
      }, RETRY_DELAY);
    }

    // Перечитываем список при каждом (пере)подключении потока: история
    // событий сервером не хранится, поэтому за время обрыва могли
    // случиться изменения, о которых мы не узнаем из SSE.
    function loadProjects() {
      clearListRetry();

      if (listLoading) return;
      listLoading = true;

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
        .then((fetchedProjects) => {
          // Применяем изменения, пришедшие во время GET.
          const changes = pendingChanges.splice(0);

          listLoaded = true;

          if (listErrorLogged) {
            console.info("Соединение с сервером восстановлено");
            listErrorLogged = false;
          }

          setIsLoading(false);
          setProjects(changes.reduce(applyProjectChange, fetchedProjects));
        })
        .catch((error: unknown) => {
          if (error instanceof Error && error.name === "AbortError") {
            return;
          }

          if (!listErrorLogged) {
            console.error("Не удалось загрузить данные о проектах:", error);
            listErrorLogged = true;
          }

          // Если GET завершился ошибкой, продолжаем работать с SSE
          // и повторяем запрос через RETRY_DELAY.
          const changes = pendingChanges.splice(0);

          listLoaded = true;

          if (changes.length > 0) {
            setProjects((current) =>
              changes.reduce(applyProjectChange, current),
            );
          }

          scheduleListRetry();
        })
        .finally(() => {
          listLoading = false;
        });
    }

    // Подключаем SSE. При штатном обрыве EventSource переподключается сам,
    // но фатальную ошибку (например, 404) он не переживает — тогда
    // пересоздаём соединение через RETRY_DELAY.
    let eventSource: EventSource | undefined;
    let reconnectTimer: ReturnType<typeof setTimeout> | undefined;
    let opened = false;
    let stopped = false;

    function scheduleReconnect() {
      if (stopped || reconnectTimer !== undefined) return;

      reconnectTimer = setTimeout(() => {
        reconnectTimer = undefined;
        connectEvents();
      }, RETRY_DELAY);
    }

    function connectEvents() {
      const source = new EventSource(apiUrl(eventsRoute));
      eventSource = source;

      const onOpen = () => {
        // Первое открытие совпадает с первичной загрузкой, поэтому
        // перечитываем список только при переподключении.
        if (opened) loadProjects();
        opened = true;
      };

      const onError = () => {
        if (source.readyState === EventSource.CLOSED) {
          source.close();
          scheduleReconnect();
        }
      };

      source.addEventListener("open", onOpen);
      source.addEventListener("error", onError);
      source.addEventListener("project-created", onProjectUpsert);
      source.addEventListener("project-updated", onProjectUpsert);
      source.addEventListener("project-deleted", onProjectDeleted);
    }

    connectEvents();

    // Список грузим сразу, не дожидаясь SSE: так он появится, даже если
    // поток недоступен.
    loadProjects();

    return () => {
      stopped = true;
      clearListRetry();

      if (reconnectTimer !== undefined) {
        clearTimeout(reconnectTimer);
      }

      eventSource?.close();
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

      {isLoading ? (
        <ProjectsLoader />
      ) : (
        <Suspense fallback={<ProjectsLoader />}>
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </Suspense>
      )}
    </section>
  );
}

export default Projects;
