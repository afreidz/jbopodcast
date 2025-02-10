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

export type Member = Prisma.membersGetPayload<{
  include: typeof memberIncludes;
}>;
