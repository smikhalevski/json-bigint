import {Reviver} from './createJsonParser';

export function revive(parent: any, key: string, reviver: Reviver): any {
  const obj = parent[key];

  if (obj !== null && typeof obj === 'object') {
    const keys = Object.keys(obj);

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const value = revive(obj, key, reviver);

      if (value !== undefined) {
        obj[key] = value;
      } else {
        delete obj[key];
      }
    }
  }

  return reviver.call(parent, key, obj);
}
