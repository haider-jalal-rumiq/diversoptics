const baseUrl = process.env.DOKPLOY_URL?.replace(/\/$/, "");
const apiKey = process.env.DOKPLOY_API_KEY;

if (!baseUrl || !apiKey) {
  throw new Error("Missing Dokploy environment configuration");
}

let lastRequestAt = 0;
async function request(path, options = {}) {
  const elapsed = Date.now() - lastRequestAt;
  if (elapsed < 5000) {
    await new Promise((resolve) => setTimeout(resolve, 5000 - elapsed));
  }

  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      ...options.headers,
    },
  });
  lastRequestAt = Date.now();

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) {
    throw new Error(`${path} failed (${response.status}): ${JSON.stringify(data)}`);
  }
  return data;
}

const get = (path) => request(path);
const post = (path, body) =>
  request(path, { method: "POST", body: JSON.stringify(body) });

const projectName = "Velmont Horlogerie";
const appName = "velmont";
const host = "velmont.apps.mdxpreview.xyz";

let projects = await get("/api/project.all");
let project = projects.find((item) => item.name === projectName);
if (!project) {
  await post("/api/project.create", {
    name: projectName,
    description: "Fictional haute horlogerie landing — cinematic editorial SPA",
  });
  projects = await get("/api/project.all");
  project = projects.find((item) => item.name === projectName);
}
if (!project) throw new Error("Dokploy project was not created");

let environments = await get(
  `/api/environment.byProjectId?projectId=${encodeURIComponent(project.projectId)}`,
);
let environment =
  environments.find((item) => item.name === "production") ?? environments[0];
if (!environment) {
  await post("/api/environment.create", {
    name: "production",
    projectId: project.projectId,
  });
  environments = await get(
    `/api/environment.byProjectId?projectId=${encodeURIComponent(project.projectId)}`,
  );
  environment =
    environments.find((item) => item.name === "production") ?? environments[0];
}
if (!environment) throw new Error("Dokploy environment was not created");

let application =
  environment.applications?.find(
    (item) => item.appName === appName || item.name === "Frontend",
  ) ?? null;
if (!application) {
  await post("/api/application.create", {
    name: "Frontend",
    appName,
    description: "Velmont Horlogerie cinematic frontend",
    environmentId: environment.environmentId,
  });
  environments = await get(
    `/api/environment.byProjectId?projectId=${encodeURIComponent(project.projectId)}`,
  );
  environment =
    environments.find((item) => item.environmentId === environment.environmentId) ??
    environments[0];
  application =
    environment?.applications?.find(
      (item) => item.appName === appName || item.name === "Frontend",
    ) ?? null;
}
if (!application) throw new Error("Dokploy application was not created");

await post("/api/application.saveGithubProvider", {
  applicationId: application.applicationId,
  repository: "VelmontHorlogerieMDX",
  owner: "Mdx2025",
  buildPath: "/",
  githubId: "5rCQYR_6G-j52Tt_NGOJp",
  branch: "main",
  triggerType: "push",
});

await post("/api/application.saveBuildType", {
  applicationId: application.applicationId,
  buildType: "dockerfile",
  dockerfile: "Dockerfile",
  dockerContextPath: "/",
  dockerBuildStage: null,
  herokuVersion: null,
  railpackVersion: null,
});

const domains = await get(
  `/api/domain.byApplicationId?applicationId=${encodeURIComponent(application.applicationId)}`,
);
if (!domains.some((item) => item.host === host)) {
  await post("/api/domain.create", {
    host,
    path: "/",
    port: 80,
    https: true,
    applicationId: application.applicationId,
    certificateType: "letsencrypt",
    stripPath: false,
  });
}

const deployment = await post("/api/application.deploy", {
  applicationId: application.applicationId,
});

console.log(
  JSON.stringify({
    projectId: project.projectId,
    environmentId: environment.environmentId,
    applicationId: application.applicationId,
    host,
    deploymentId: deployment?.deploymentId ?? deployment?.id ?? null,
    deploymentStatus: deployment?.status ?? null,
  }),
);
