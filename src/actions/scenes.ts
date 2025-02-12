import { z } from "astro:schema";
import client from "$/lib/prisma";
import { Prisma } from "@prisma/client";
import { memberIncludes } from "./members";
import { CALL_SCENE } from "@prisma/client";
import { defineAction } from "astro:actions";

export const SceneCreateSchema = z.object({
  callId: z.string(),
  AID: z.string().optional(),
  BID: z.string().optional(),
  CID: z.string().optional(),
  DID: z.string().optional(),
  type: z.nativeEnum(CALL_SCENE),
  label: z.string().min(1).max(25),
  countdownMS: z.number().optional(),
  splashImageURL: z.string().url().optional(),
});

export const sceneIncludes = {
  call: true,
  A: { include: memberIncludes },
  B: { include: memberIncludes },
  C: { include: memberIncludes },
  D: { include: memberIncludes },
};

export const create = defineAction({
  input: z.array(SceneCreateSchema),
  async handler(input) {
    return await client.scene.createManyAndReturn({
      data: input,
      include: sceneIncludes,
    });
  },
});

export type Scene = Prisma.sceneGetPayload<{
  include: typeof sceneIncludes;
}>;

export type SceneCreateSchema = z.infer<typeof SceneCreateSchema>;
