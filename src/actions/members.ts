import client from "$/lib/prisma";
import type { Prisma } from "@prisma/client";
import { defineAction } from "astro:actions";

export const memberIncludes = {
  user: { select: { email: true } },
};

export const getAll = defineAction({
  handler: async () => {
    return await client.members.findMany({
      include: memberIncludes,
    });
  },
});

export const getMe = defineAction({
  handler: async (_, context) => {
    return await client.members.findFirst({
      where: { id: context.locals.user.id },
      include: memberIncludes,
    });
  },
});

export type Member = Prisma.membersGetPayload<{
  include: typeof memberIncludes;
}>;
