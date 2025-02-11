import { z } from "astro:schema";
import client from "$/lib/prisma";
import { defineAction } from "astro:actions";
import { Prisma } from "@prisma/client";

export const offerToPeer = defineAction({
  input: z.object({
    to: z.string(),
    call: z.string(),
    from: z.string(),
    ice: z.any().optional(),
    offer: z.any().optional(),
  }),
  async handler(input) {
    const existing = await client.connection.findFirst({
      where: {
        toId: input.to,
        callId: input.call,
        fromId: input.from,
      },
    });

    if (existing) {
      return await client.connection.update({
        where: { id: existing.id },
        data: {
          ice: input.ice,
          offer: input.offer,
          answer: Prisma.JsonNull,
        },
      });
    }

    return await client.connection.create({
      data: {
        toId: input.to,
        ice: input.ice,
        callId: input.call,
        offer: input.offer,
        fromId: input.from,
      },
    });
  },
});

export const updateConnection = defineAction({
  input: z.object({
    id: z.string(),
    ice: z.any().optional(),
    offer: z.any().optional(),
    answer: z.any().optional(),
  }),
  async handler(input) {
    return await client.connection.update({
      where: { id: input.id },
      data: {
        ice: input.ice,
        offer: input.offer,
        answer: input.answer,
      },
    });
  },
});

export const disconnect = defineAction({
  input: z.object({
    call: z.string(),
    member: z.string(),
  }),
  async handler(input) {
    return await client.connection.deleteMany({
      where: {
        OR: [
          { callId: input.call, fromId: input.member },
          { callId: input.call, toId: input.member },
        ],
      },
    });
  },
});

export type Connection = Prisma.connectionGetPayload<{}>;
