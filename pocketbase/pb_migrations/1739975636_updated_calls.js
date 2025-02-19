/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_300278372")

  // update collection data
  unmarshal({
    "createRule": null,
    "deleteRule": null,
    "updateRule": null
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_300278372")

  // update collection data
  unmarshal({
    "createRule": "host = @request.auth.id",
    "deleteRule": "host = @request.auth.id",
    "updateRule": "host = @request.auth.id"
  }, collection)

  return app.save(collection)
})
