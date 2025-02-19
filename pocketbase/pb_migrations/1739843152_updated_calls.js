/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_300278372")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE UNIQUE INDEX `idx_fMt3RPxdMf` ON `calls` (\n  `scheduled`,\n  `host`\n)"
    ]
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_300278372")

  // update collection data
  unmarshal({
    "indexes": []
  }, collection)

  return app.save(collection)
})
