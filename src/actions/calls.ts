import type {
  UsersRecord,
  CallsResponse,
  ScenesResponse,
} from "@pocketbase/types";

import { z } from "astro:schema";
import { defineAction } from "astro:actions";
import type { ListResult } from "pocketbase";
import { refresh } from "$/lib/pocketbase/server";
import { ScenesTypeOptions } from "@pocketbase/types";
import { queryBuilder, query } from "$/lib/pocketbase/server";

export const expand =
  "host,guests,scenes,scenes.A,scenes.B,scenes.C,scenes.D,activeScene,activeScene.A,activeScene.B,activeScene.C,activeScene.D";

export const SceneCreateSchema = z.object({
  callId: z.string(),
  A: z.string().optional(),
  B: z.string().optional(),
  C: z.string().optional(),
  D: z.string().optional(),
  label: z.string().max(25).optional(),
  type: z.nativeEnum(ScenesTypeOptions),
  splashURL: z.string().url().optional(),
  countdownMS: z.coerce.number().optional(),
});
export type SceneCreateSchema = z.infer<typeof SceneCreateSchema>;

const CallScheama = z.object({
  host: z.string(),
  scheduled: z.coerce.date(),
  title: z.string().max(100),
  guests: z.array(z.string()),
  scenes: z.array(SceneCreateSchema.omit({ callId: true })),
});

export const create = defineAction({
  input: CallScheama,
  handler: async (input, context) => {
    const { scenes, ...data } = input;

    const client = await refresh(
      context.locals.client,
      context.request.headers.get("cookie")
    );

    if (scenes.length) {
      const batch = client.createBatch();

      scenes.forEach((scene) => {
        batch.collection("scenes").create(scene);
      });

      try {
        const sr = await batch.send().catch((err) => {
          console.error(JSON.stringify(err, null, 2));
          return null;
        });

        if (!sr) return null;
        return await client.collection("calls").create({
          ...data,
          scenes: sr.map((r) => r.body.id),
        });
      } catch (err) {
        throw err;
      }
    } else {
      return await client.collection("calls").create({ ...data });
    }
  },
});

export const getUpcoming = defineAction({
  input: z.object({
    date: z.coerce.date(),
    userId: z.string(),
  }),
  handler: async ({ date, userId }, context) => {
    const client = await refresh(
      context.locals.client,
      context.request.headers.get("cookie")
    );

    const filter = queryBuilder(
      query.and(
        query.gte("scheduled", date),
        query.or(query.eq("host", userId), query.like("guests", userId))
      )
    );

    const response = await client.collection("calls").getList<Call>(0, 5, {
      expand,
      filter,
    });

    return response.items;
  },
});

export const getById = defineAction({
  input: z.string(),
  handler: async (id, context) => {
    const client = await refresh(
      context.locals.client,
      context.request.headers.get("cookie")
    );
    return await client.collection("calls").getOne<Call>(id, { expand });
  },
});

export const list = defineAction({
  input: z.object({
    page: z.number().min(1),
    per: z.number().min(1),
    filter: z.string().optional(),
  }),
  async handler({ page, per, filter }, context) {
    const client = await refresh(
      context.locals.client,
      context.request.headers.get("cookie")
    );
    return await client.collection("calls").getList<Call>(page, per, {
      filter,
      expand,
      sort: "scheduled",
    });
  },
});

export const setActiveScene = defineAction({
  input: z.object({
    call: z.string(),
    scene: z.string(),
  }),
  async handler({ call, scene }, context) {
    const client = await refresh(
      context.locals.client,
      context.request.headers.get("cookie")
    );
    return await client
      .collection("calls")
      .update(call, { activeScene: scene });
  },
});

export type Scene = ScenesResponse<{
  A?: UsersRecord;
  B?: UsersRecord;
  C?: UsersRecord;
  D?: UsersRecord;
}>;

export type Call = CallsResponse<{
  scenes: Scene[];
  host: UsersRecord;
  activeScene: Scene;
  guests: UsersRecord[];
}>;

export type PaginatedCalls = ListResult<Call>;
