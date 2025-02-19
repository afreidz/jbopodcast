/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_300278372")

  // update collection data
  unmarshal({
    "listRule": "",
    "viewRule": ""
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_300278372")

  // update collection data
  unmarshal({
    "listRule": "host = @request.auth.id || guests ~ @request.auth.id ",
    "viewRule": "host = @request.auth.id || guests ~ @request.auth.id "
  }, collection)

  return app.save(collection)
})
