import { NextFunction, Request, Response } from "express";
import {
  CreatePostRequestBodyI,
  PostRawDataI,
  PostsRequestParamsI,
  UpdatePostRequestBodyI,
} from "./interface";
import { db } from "../../config/sqldb";
import { QueryResult } from "mysql2";

export const getAllPosts = (
  req: Request<PostsRequestParamsI>,
  res: Response,
  next: NextFunction
) => {
  const params = {
    page: req?.params?.page || 1,
    size: req?.params?.size || 10,
  };

  const limit = params.size;
  const offset = (params.page - 1) * params.size;

  db.query(
    "SELECT * FROM posts LIMIT ? OFFSET ?",
    [limit, offset],
    (err, results) => {
      if (err) {
        res.status(500).json({
          error: "QUERY_FAIL",
        });
        return;
      }

      res.status(200).json(results);
    }
  );
};

export const createPost = (
  req: Request<void, void, CreatePostRequestBodyI>,
  res: Response
) => {
  const post = {
    title: req.body.title,
    content: req.body.content,
    author: req.body.author,
  };

  db.execute(
    `INSERT INTO posts (title, post_text, user_name) VALUES (?, ?, ?)`,
    [post.title, post.content, post.author],
    (err, results) => {
      if (err) {
        res.status(500).json({
          error: "QUERY_FAIL",
        });
        return;
      }

      res.status(200).json({ status: "ok", data: post });
    }
  );
};

export const updatePost = async (
  req: Request<{ id: string }, void, UpdatePostRequestBodyI>,
  res: Response
) => {
  const id = Number(req.params.id);
  let post: UpdatePostRequestBodyI = {};

  db.execute(
    `SELECT * FROM posts WHERE id = ?`,
    [id],
    (err, results: QueryResult | PostRawDataI[]) => {
      if (err) {
        res.status(500).json({
          error: "QUERY_ROW_FAIL",
        });
        return;
      }

      const result = (results as PostRawDataI[])[0];

      post = {
        title: req.body.title ?? result.title,
        content: req.body.content ?? result.post_text,
        author: req.body.author ?? result.user_name,
      };

      db.execute(
        `UPDATE posts SET title = ?, post_text = ?, user_name = ? WHERE id = ?`,
        [post?.title, post?.content, post?.author, id],
        (err) => {
          if (err) {
            res.status(500).json({
              error: "QUERY_FAIL",
            });
            return;
          }

          res.status(200).json({ status: "ok", data: post });
        }
      );
    }
  );
};

export const deletePost = (req: Request<{ id: string }>, res: Response) => {
  const id = Number(req.params.id);

  db.execute(`DELETE FROM posts WHERE id = ?`, [id], (err) => {
    if (err) {
      res.status(500).json({
        error: "QUERY_FAIL",
      });
      return;
    }

    res.status(200).json({ status: "ok" });
  });
};
