import express from "express";
import {
  createPost,
  deletePost,
  getAllPosts,
  updatePost,
} from "../../controllers/posts/postController";

const router = express.Router();

router.get("/", getAllPosts);
router.post("/create", createPost);
router.route("/:id").put(updatePost).delete(deletePost);

module.exports = router;
