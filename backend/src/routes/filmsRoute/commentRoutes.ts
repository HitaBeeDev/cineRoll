import { Router } from "express";

import { AuthedRequest, OptionallyAuthedRequest, optionalAuth, requireAuth } from "../../middleware/auth";
import { getValidated, validate } from "../../middleware/validate";
import {
  addFilmComment,
  listFilmComments,
  removeFilmComment,
} from "./commentService";
import {
  commentBodySchema,
  CommentBody,
  commentParamsSchema,
  CommentParams,
  commentsQuerySchema,
  CommentsQuery,
  slugParamsSchema,
  SlugParams,
} from "./schemas";

export const filmCommentsRouter = Router();

filmCommentsRouter.get(
  "/:slug/comments",
  optionalAuth,
  validate(slugParamsSchema, "params"),
  validate(commentsQuerySchema, "query"),
  async (req, res) => {
    const userId = (req as OptionallyAuthedRequest).userId;
    const { slug } = getValidated<SlugParams>(req, "params");
    const { page } = getValidated<CommentsQuery>(req, "query");

    res.json(await listFilmComments(slug, page, userId));
  },
);

filmCommentsRouter.post(
  "/:slug/comments",
  requireAuth,
  validate(slugParamsSchema, "params"),
  validate(commentBodySchema, "body"),
  async (req, res) => {
    const userId = (req as AuthedRequest).userId;
    const { slug } = getValidated<SlugParams>(req, "params");
    const { body } = getValidated<CommentBody>(req, "body");

    res.status(201).json(await addFilmComment(userId, slug, body));
  },
);

filmCommentsRouter.delete(
  "/:slug/comments/:id",
  requireAuth,
  validate(commentParamsSchema, "params"),
  async (req, res) => {
    const userId = (req as AuthedRequest).userId;
    const { id } = getValidated<CommentParams>(req, "params");

    await removeFilmComment(userId, id);
    res.status(204).send();
  },
);
