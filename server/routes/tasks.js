import express from "express";
import {
  createTask,
  deleteTask,
  getTasks,
  updateTask,
} from "../controllers/tasksController.js";

const router = express.Router();

router.get("/", getTasks);
router.post("/", createTask);
router.patch("/:id", updateTask);
router.delete("/:id", deleteTask);

export default router;