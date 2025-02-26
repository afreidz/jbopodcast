/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1325916001")

  // add field
  collection.fields.addAt(7, new Field({
    "hidden": false,
    "id": "json4234235736",
    "maxSize": 0,
    "name": "from_ice_candidates",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  // update field
  collection.fields.addAt(5, new Field({
    "hidden": false,
    "id": "json3410985998",
    "maxSize": 0,
    "name": "to_ice_candidates",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1325916001")

  // remove field
  collection.fields.removeById("json4234235736")

  // update field
  collection.fields.addAt(5, new Field({
    "hidden": false,
    "id": "json3410985998",
    "maxSize": 0,
    "name": "ice",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  return app.save(collection)
})
