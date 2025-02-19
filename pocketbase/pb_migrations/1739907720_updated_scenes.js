/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1254289504")

  // remove field
  collection.fields.removeById("relation3431870270")

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1254289504")

  // add field
  collection.fields.addAt(3, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_300278372",
    "hidden": false,
    "id": "relation3431870270",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "call",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
})
