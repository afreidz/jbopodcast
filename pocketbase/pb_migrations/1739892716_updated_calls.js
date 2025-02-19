/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_300278372")

  // update field
  collection.fields.addAt(8, new Field({
    "hidden": false,
    "id": "date3029767898",
    "max": "",
    "min": "",
    "name": "started",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "date"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_300278372")

  // update field
  collection.fields.addAt(8, new Field({
    "hidden": false,
    "id": "date3029767898",
    "max": "",
    "min": "",
    "name": "started",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "date"
  }))

  return app.save(collection)
})
