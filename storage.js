// filename: js/storage.js
// Simple localStorage wrapper for collections
(function (global) {
  const KEY_PREFIX = "regsys__";

  function _key(name) { return KEY_PREFIX + name; }

  function getCollection(name) {
    const raw = localStorage.getItem(_key(name));
    if (!raw) return [];
    try { return JSON.parse(raw); } catch (e) { console.error("parse error", e); return []; }
  }

  function setCollection(name, arr) {
    localStorage.setItem(_key(name), JSON.stringify(arr));
  }

  function upsert(name, item, idField = "id") {
    const arr = getCollection(name);
    if (!item[idField]) {
      item[idField] = `${name}_${Date.now()}_${Math.floor(Math.random()*999)}`;
      arr.push(item);
    } else {
      const idx = arr.findIndex(x => x[idField] === item[idField]);
      if (idx >= 0) arr[idx] = item; else arr.push(item);
    }
    setCollection(name, arr);
    return item;
  }

  function remove(name, id, idField = "id") {
    const arr = getCollection(name);
    const filtered = arr.filter(x => x[idField] !== id);
    setCollection(name, filtered);
    return filtered;
  }

  function find(name, predicate) {
    return getCollection(name).filter(predicate);
  }

  function getById(name, id, idField = "id") {
    return getCollection(name).find(x => x[idField] === id);
  }

  // export
  global.storage = {
    getCollection, setCollection, upsert, remove, find, getById
  };
})(window);
