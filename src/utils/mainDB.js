import { openDB } from "idb";

export const dbPromise = openDB("trakio-db", 2, {
  upgrade(db, oldVersion) {
    if (oldVersion < 1) {
      db.createObjectStore("subscriptions", { keyPath: "id" });
    }

    if (oldVersion < 2) {
      const queue = db.createObjectStore("queue", { keyPath: "id" });
      queue.createIndex("by_created", "createdAt");
    }
  },
});
