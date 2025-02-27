import { z } from "astro:schema";
import { defineAction } from "astro:actions";
import { refresh } from "$/lib/pocketbase/server";
import type { ConnectionsResponse } from "@pocketbase/types";
import { queryBuilder, query } from "$/lib/pocketbase/server";

const expand = "to,from";

export const offerToPeer = defineAction({
  input: z.object({
    to: z.string(),
    call: z.string(),
    from: z.string(),
    offer: z.any().optional(),
    fromIce: z.any().optional(),
  }),
  async handler(input, context) {
    const client = await refresh(
      context.locals.client,
      context.request.headers.get("cookie")
    );

    const filter = queryBuilder(
      query.and(
        query.eq("to", input.to),
        query.eq("call", input.call),
        query.eq("from", input.from)
      )
    );

    const existing = await client
      .collection("connections")
      .getFirstListItem(filter)
      .catch(() => null);

    if (existing) {
      return await client.collection("connections").update<Connection>(
        existing.id,
        {
          answer: null,
          offer: input.offer,
          from_ice_candidates: input.fromIce,
        },
        { expand }
      );
    }

    return await client.collection("connections").create<Connection>(
      {
        to: input.to,
        call: input.call,
        from: input.from,
        offer: input.offer,
        from_ice_candidates: input.fromIce,
      },
      { expand }
    );
  },
});

export const find = defineAction({
  input: z.object({
    to: z.string(),
    from: z.string(),
    call: z.string(),
  }),
  async handler({ to, from, call }, context) {
    const client = await refresh(
      context.locals.client,
      context.request.headers.get("cookie")
    );

    const filter = queryBuilder(
      query.and(
        query.eq("to", to),
        query.eq("from", from),
        query.eq("call", call)
      )
    );

    return await client
      .collection("connections")
      .getFirstListItem(filter, { expand })
      .catch(() => null);
  },
});

export const getOffers = defineAction({
  input: z.object({
    call: z.string(),
    member: z.string(),
  }),
  async handler({ call, member }, context) {
    const client = await refresh(
      context.locals.client,
      context.request.headers.get("cookie")
    );

    const filter = queryBuilder(
      query.and(query.eq("to", member), query.eq("call", call))
    );

    return await client
      .collection("connections")
      .getList(0, Number.MAX_SAFE_INTEGER, { filter, expand });
  },
});

export const updateConnection = defineAction({
  input: z.object({
    id: z.string(),
    toIce: z.any().optional(),
    offer: z.any().optional(),
    answer: z.any().optional(),
    fromIce: z.any().optional(),
  }),
  async handler(input, context) {
    const client = await refresh(
      context.locals.client,
      context.request.headers.get("cookie")
    );

    return await client.collection("connections").update(
      input.id,
      {
        offer: input.offer,
        answer: input.answer,
        to_ice_candidates: input.toIce,
        from_ice_candidates: input.fromIce,
      },
      { expand }
    );
  },
});

export const disconnect = defineAction({
  input: z.object({
    call: z.string(),
    member: z.string(),
  }),
  async handler(input, context) {
    const client = await refresh(
      context.locals.client,
      context.request.headers.get("cookie")
    );

    const filter = queryBuilder(
      query.and(
        query.eq("call", input.call),
        query.or(query.eq("to", input.member), query.eq("from", input.member))
      )
    );

    const records = await client
      .collection("connections")
      .getList(0, Number.MAX_SAFE_INTEGER, {
        filter,
      });

    if (!records.items.length) return;

    const batch = client.createBatch();

    records.items.forEach((r) => {
      batch.collection("connections").delete(r.id);
    });

    return await batch.send();
  },
});

export type Connection = ConnectionsResponse;
