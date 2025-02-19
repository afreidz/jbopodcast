/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1254289504")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.role = \"host\" || @request.auth.role = \"admin\"",
    "deleteRule": "@request.auth.role = \"host\" || @request.auth.role = \"admin\"",
    "updateRule": "@request.auth.role = \"host\" || @request.auth.role = \"admin\""
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1254289504")

  // update collection data
  unmarshal({
    "createRule": null,
    "deleteRule": null,
    "updateRule": null
  }, collection)

  return app.save(collection)
})
