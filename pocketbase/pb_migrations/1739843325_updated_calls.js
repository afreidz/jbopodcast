/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_300278372")

  // add field
  collection.fields.addAt(5, new Field({
    "cascadeDelete": true,
    "collectionId": "pbc_1325916001",
    "hidden": false,
    "id": "relation3220634645",
    "maxSelect": 999,
    "minSelect": 0,
    "name": "connections",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_300278372")

  // remove field
  collection.fields.removeById("relation3220634645")

  return app.save(collection)
})
