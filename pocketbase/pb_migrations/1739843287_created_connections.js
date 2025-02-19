/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = new Collection({
    "createRule": null,
    "deleteRule": null,
    "fields": [
      {
        "autogeneratePattern": "[a-z0-9]{15}",
        "hidden": false,
        "id": "text3208210256",
        "max": 15,
        "min": 15,
        "name": "id",
        "pattern": "^[a-z0-9]+$",
        "presentable": false,
        "primaryKey": true,
        "required": true,
        "system": true,
        "type": "text"
      },
      {
        "cascadeDelete": true,
        "collectionId": "_pb_users_auth_",
        "hidden": false,
        "id": "relation3105530224",
        "maxSelect": 1,
        "minSelect": 0,
        "name": "from",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "relation"
      },
      {
        "cascadeDelete": true,
        "collectionId": "_pb_users_auth_",
        "hidden": false,
        "id": "relation3616002756",
        "maxSelect": 1,
        "minSelect": 0,
        "name": "to",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "relation"
      },
      {
        "hidden": false,
        "id": "json701925182",
        "maxSize": 0,
        "name": "offer",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "json"
      },
      {
        "hidden": false,
        "id": "json3671935525",
        "maxSize": 0,
        "name": "answer",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "json"
      },
      {
        "hidden": false,
        "id": "json3410985998",
        "maxSize": 0,
        "name": "ice",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "json"
      },
      {
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
      },
      {
        "hidden": true,
        "id": "autodate2990389176",
        "name": "created",
        "onCreate": true,
        "onUpdate": false,
        "presentable": false,
        "system": false,
        "type": "autodate"
      },
      {
        "hidden": true,
        "id": "autodate3332085495",
        "name": "updated",
        "onCreate": true,
        "onUpdate": true,
        "presentable": false,
        "system": false,
        "type": "autodate"
      }
    ],
    "id": "pbc_1325916001",
    "indexes": [
      "CREATE UNIQUE INDEX `idx_wdATfMMoBz` ON `connections` (\n  `from`,\n  `to`,\n  `call`\n)"
    ],
    "listRule": null,
    "name": "connections",
    "system": false,
    "type": "base",
    "updateRule": null,
    "viewRule": null
  });

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1325916001");

  return app.delete(collection);
})
