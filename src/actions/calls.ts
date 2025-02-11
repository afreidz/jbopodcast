import { z } from "astro:schema";
import client from "$/lib/prisma";
import { memberIncludes } from "./members";
import { defineAction } from "astro:actions";
import type { Prisma } from "@prisma/client";

export const create = defineAction({
  accept: "form",
  input: z.object({
    scheduled: z.coerce.date(),
    guests: z.array(z.string()),
    title: z.string().min(3).max(100),
  }),
  handler: async (input, context) => {
    const { guests, ...data } = input;
    return await client.calls.create({
      data: {
        ...data,
        hostId: context.locals.user.id,
        guests: { connect: guests.map((id) => ({ id })) },
      },
    });
  },
});

export const callIncludes = {
  guests: {
    include: memberIncludes,
  },
  host: {
    include: memberIncludes,
  },
};

export const getUpcoming = defineAction({
  input: z.coerce.date(),
  handler: async (date, context) => {
    return await client.calls.findMany({
      take: 5,
      where: {
        AND: [
          {
            OR: [
              {
                hostId: context.locals.user.id,
              },
              {
                guests: { some: { id: context.locals.user.id } },
              },
            ],
          },
          {
            completed: null,
            scheduled: { gte: date },
          },
        ],
      },
      include: callIncludes,
    });
  },
});

export const getById = defineAction({
  input: z.string(),
  handler: async (id) => {
    return await client.calls.findFirst({
      where: { id },
      include: { ...callIncludes, connections: true },
    });
  },
});

export type Call = Prisma.callsGetPayload<{ include: typeof callIncludes }>;
export type CallWithConnections = Prisma.callsGetPayload<{
  include: typeof callIncludes & { connections: true };
}>;
