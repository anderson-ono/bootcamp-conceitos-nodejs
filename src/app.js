const express = require("express");
const cors = require("cors");
const { uuid, isUuid } = require("uuidv4");

const app = express();

app.use(express.json());
app.use(cors());

const repositories = [];

function validateProjectId (request, response, next) {
  const { id } = request.params;

  if(!isUuid(id)) {
    return response.status(400).json({
      "error": "Invalid Project Id",
    })
  }

  return next();
}

function validateProjectExists (request, response, next) {
  const { id } = request.params;

  const repositoryIndex = repositories.findIndex(repository => repository.id === id);

  if(repositoryIndex < 0) {
    return response.status(400).json({
      "error": "Project not exists",
    })
  }

  request.repositoryIndex = repositoryIndex;

  return next();
}

app.use("/repositories/:id", validateProjectId, validateProjectExists);

app.get("/repositories", (request, response) => {
  return response.json(repositories);
});

app.post("/repositories", (request, response) => {
  const { title, url, techs } = request.body;

  const repository = {
    id: uuid(),
    title,
    url,
    techs,
    likes: 0,
  }

  repositories.push(repository);

  return response.json(repository);
});

app.put("/repositories/:id", (request, response) => {
  const { title, url, techs } = request.body;
  const repositoryIndex = request.repositoryIndex;

  const repository = repositories[repositoryIndex];

  repository.title = title;
  repository.url = url;
  repository.techs = techs;

  return response.json(repository);
});

app.delete("/repositories/:id", (request, response) => {
  const repositoryIndex = request.repositoryIndex;

  repositories.splice(repositoryIndex, 1);
  
  return response.status(204).send();
});

app.post("/repositories/:id/like", validateProjectId, validateProjectExists, (request, response) => {
  const repositoryIndex = request.repositoryIndex;

  const repository = repositories[repositoryIndex];

  repository.likes += 1;

  return response.json(repository);

});

module.exports = app;
