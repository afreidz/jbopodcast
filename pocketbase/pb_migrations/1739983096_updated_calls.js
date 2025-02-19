/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_300278372")

  // update collection data
  unmarshal({
    "createRule": "host.id = @request.auth.id",
    "deleteRule": "host.id = @request.auth.id",
    "listRule": "host.id = @request.auth.id || guests ~ @request.auth.id",
    "updateRule": "host.id = @request.auth.id",
    "viewRule": "host.id = @request.auth.id || guests ~ @request.auth.id"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_300278372")

  // update collection data
  unmarshal({
    "createRule": null,
    "deleteRule": null,
    "listRule": "",
    "updateRule": null,
    "viewRule": ""
  }, collection)

  return app.save(collection)
})
