/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1325916001")

  // update collection data
  unmarshal({
    "createRule": "",
    "deleteRule": "",
    "listRule": "",
    "updateRule": "",
    "viewRule": ""
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1325916001")

  // update collection data
  unmarshal({
    "createRule": "to = @request.auth.id || from = @request.auth.id",
    "deleteRule": "to = @request.auth.id || from = @request.auth.id",
    "listRule": "to = @request.auth.id || from = @request.auth.id",
    "updateRule": "to = @request.auth.id || from = @request.auth.id",
    "viewRule": "to = @request.auth.id || from = @request.auth.id"
  }, collection)

  return app.save(collection)
})
