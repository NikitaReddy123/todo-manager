"use strict";
const { Model, Op } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Todo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }

    static getTodos() {
      return this.findAll();
    }

    static async overdue() {
      return await Todo.findAll({
        where: {
          dueDate: {
            [Op.lt]: new Date(),
          },
          completed: false,
        },
        order: [["id", "ASC"]],
      });
    }
    static async dueToday() {
      return await Todo.findAll({
        where: {
          dueDate: {
            [Op.eq]: new Date(),
          },
          completed: false,
        },
        order: [["id", "ASC"]],
      });
    }
    static async dueLater() {
      return await Todo.findAll({
        where: {
          dueDate: {
            [Op.gt]: new Date(),
          },
          completed: false,
        },
        order: [["id", "ASC"]],
      });
    }
    static async completedTodos() {
      return await Todo.findAll({
        where: {
          completed: true,
        },
        order: [["id", "ASC"]],
      });
    }

    static async remove(id) {
      return this.destroy({
        where: {
          id,
        },
      });
    }
    static addTodo({ title, dueDate }) {
      return this.create({ title: title, dueDate: dueDate, completed: false });
    }

    setCompletionStatus(status) {
      return this.update({ completed: status });
    }
  }
  Todo.init(
    {
      title: DataTypes.STRING,
      dueDate: DataTypes.DATEONLY,
      completed: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "Todo",
    }
  );
  return Todo;
};
