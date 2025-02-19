/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_300278372")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE UNIQUE INDEX `idx_fMt3RPxdMf` ON `calls` (\n  `created`,\n  `host`\n)"
    ]
  }, collection)

  // add field
  collection.fields.addAt(7, new Field({
    "hidden": false,
    "id": "date3001571657",
    "max": "",
    "min": "",
    "name": "scheduled",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "date"
  }))

  // add field
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

  // update field
  collection.fields.addAt(9, new Field({
    "hidden": true,
    "id": "autodate3001571657",
    "name": "created",
    "onCreate": true,
    "onUpdate": false,
    "presentable": false,
    "system": false,
    "type": "autodate"
  }))

  // update field
  collection.fields.addAt(10, new Field({
    "hidden": true,
    "id": "autodate3029767898",
    "name": "updated",
    "onCreate": false,
    "onUpdate": true,
    "presentable": false,
    "system": false,
    "type": "autodate"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_300278372")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE UNIQUE INDEX `idx_fMt3RPxdMf` ON `calls` (\n  `scheduled`,\n  `host`\n)"
    ]
  }, collection)

  // remove field
  collection.fields.removeById("date3001571657")

  // remove field
  collection.fields.removeById("date3029767898")

  // update field
  collection.fields.addAt(7, new Field({
    "hidden": false,
    "id": "autodate3001571657",
    "name": "scheduled",
    "onCreate": true,
    "onUpdate": false,
    "presentable": false,
    "system": false,
    "type": "autodate"
  }))

  // update field
  collection.fields.addAt(8, new Field({
    "hidden": false,
    "id": "autodate3029767898",
    "name": "started",
    "onCreate": false,
    "onUpdate": true,
    "presentable": false,
    "system": false,
    "type": "autodate"
  }))

  return app.save(collection)
})
