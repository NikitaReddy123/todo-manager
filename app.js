const express = require("express");
const app = express();
const path = require("path");
const { Todo } = require("./models");
const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

app.get("/", async (request, response) => {
  try {
    const allTodos = await Todo.getTodos();
    if (request.accepts("html")) {
      response.render("index", {
        title: "Todo_App",
        allTodos,
      });
    } else {
      response.json({
        allTodos,
      });
    }
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.get("/todos", async function (_request, response) {
  console.log("Processing list of all Todos ...");
  try {
    const todo = await Todo.findAll();
    return response.json(todo);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.get("/todos/:id", async function (request, response) {
  try {
    const todo = await Todo.findByPk(request.params.id);
    return response.json(todo);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.post("/todos", async function (request, response) {
  try {
    const todo = await Todo.addTodo(request.body);
    return response.json(todo);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.put("/todos/:id/markAsCompleted", async function (request, response) {
  const todo = await Todo.findByPk(request.params.id);
  try {
    const updatedTodo = await todo.markAsCompleted();
    return response.json(updatedTodo);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.delete("/todos/:id", async function (request, response) {
  console.log("We have to delete a Todo with ID: ", request.params.id);
  try {
    const deleteRes = await Todo.destroy({ where: { id: request.params.id } });
    response.send(deleteRes == 1);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

module.exports = app;
