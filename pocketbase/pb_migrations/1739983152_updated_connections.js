/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1325916001")

  // update collection data
  unmarshal({
    "createRule": "from = @request.auth.id",
    "deleteRule": "from = @request.auth.id || to = @request.auth.id",
    "listRule": "from = @request.auth.id || to = @request.auth.id",
    "updateRule": "from = @request.auth.id || to = @request.auth.id",
    "viewRule": "from = @request.auth.id || to = @request.auth.id"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1325916001")

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
