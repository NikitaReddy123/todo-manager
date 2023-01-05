const request = require("supertest");
var cheerio = require("cheerio");
const db = require("../models/index");
const app = require("../app");
let server, agent;
function gettoken(res) {
  var $ = cheerio.load(res.text);
  return $("[name=_csrf]").val();
}
describe("Todo Application test", function () {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
    server = app.listen(4000, () => {});
    agent = request.agent(server);
  });

  afterAll(async () => {
    try {
      await db.sequelize.close();
      await server.close();
    } catch (error) {
      console.log(error);
    }
  });

  test("creating a todo", async () => {
    const res = await agent.get("/");
    const ctk = gettoken(res);
    const response = await agent.post("/todos").send({
      title: "Watch drama",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: ctk,
    });
    expect(response.statusCode).toBe(302);
  });

  test("updating a todo", async () => {
    let res = await agent.get("/");
    let ctk = gettoken(res);
    await agent.post("/todos").send({
      title: "Go to college",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: ctk,
    });
    const groupedTodosResponse = await agent
      .get("/")
      .set("Accept", "application/json");
    const parsedGroupedResponse = JSON.parse(groupedTodosResponse.text);
    const dueTodayCount = parsedGroupedResponse.duetodaytodos.length;
    const latestTodo = parsedGroupedResponse.duetodaytodos[dueTodayCount - 1];
    res = await agent.get("/");
    ctk = gettoken(res);

    const markCompleteResponse = await agent
      .put(`/todos/${latestTodo.id}`)
      .send({
        _csrf: ctk,
        completed: true,
      });
    const parsedUpdateResponse = JSON.parse(markCompleteResponse.text);
    expect(parsedUpdateResponse.completed).toBe(true);
  });
  test("Updates a todo false", async () => {
    let res = await agent.get("/");
    let ctk = gettoken(res);
    await agent.post("/todos").send({
      title: "Buy cloths ",
      dueDate: new Date().toISOString(),
      completed: true,
      _csrf: ctk,
    });

    const groupedTodosResponse = await agent
      .get("/")
      .set("Accept", "application/json");
    const parsedGroupedResponse = JSON.parse(groupedTodosResponse.text);
    const dueTodayCount = parsedGroupedResponse.duetodaytodos.length;
    const latestTodo = parsedGroupedResponse.duetodaytodos[dueTodayCount - 1];

    res = await agent.get("/");
    ctk = gettoken(res);

    const markCompleteResponse = await agent
      .put(`/todos/${latestTodo.id}`)
      .send({
        _csrf: ctk,
        completed: false,
      });
    const parsedUpdateResponse = JSON.parse(markCompleteResponse.text);
    expect(parsedUpdateResponse.completed).toBe(false);
  });
  test("Deleting a todo", async () => {
    let res = await agent.get("/");
    let ctk = gettoken(res);
    await agent.post("/todos").send({
      title: "Play games",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: ctk,
    });
    const groupedTodosResponse = await agent
      .get("/")
      .set("Accept", "application/json");
    const parsedGroupedResponse = JSON.parse(groupedTodosResponse.text);
    const dueTodayCount = parsedGroupedResponse.duetodaytodos.length;
    const latestTodo = parsedGroupedResponse.duetodaytodos[dueTodayCount - 1];
    res = await agent.get("/");
    ctk = gettoken(res);
    const todoid = latestTodo.id;
    const deleteResponseTrue = await agent.delete(`/todos/${todoid}`).send({
      _csrf: ctk,
    });
    const parsedDeleteResponseTrue = JSON.parse(
      deleteResponseTrue.text
    ).success;
    expect(parsedDeleteResponseTrue).toBe(true);
    res = await agent.get("/");
    ctk = gettoken(res);

    const deleteResponseFail = await agent.delete(`/todos/${todoid}`).send({
      _csrf: ctk,
    });
    const parsedDeleteResponseFail = JSON.parse(
      deleteResponseFail.text
    ).success;
    expect(parsedDeleteResponseFail).toBe(false);
  });
});
