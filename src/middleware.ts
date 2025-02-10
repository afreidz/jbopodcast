import { sequence } from "astro:middleware";
import { onRequest as sessionMiddleware } from "$/lib/middleware/session";

export const onRequest = sequence(sessionMiddleware);
