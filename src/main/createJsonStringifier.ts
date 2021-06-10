export function createJsonStringifier(): (val: any) => string {
  const stringify = (val: any): string | undefined => {
    switch (typeof val) {

      case 'number':
        if (val > Number.MAX_SAFE_INTEGER) {
          return val.toExponential();
        }
        if (val % 1 === 0) {
          return val.toFixed(1);
        }
        return val.toString(10);

      case 'bigint':
        return val.toString(10);

      case 'object':
        if (val === null) {
          return 'null';
        }
        if (Array.isArray(val)) {
          let str = '[';
          for (let i = 0; i < val.length; i++) {
            if (i > 0) {
              str += ',';
            }
            let json = stringify(val[i]);
            if (json === undefined) {
              json = 'null';
            }
            str += json;
          }
          return str += ']';
        } else {
          let str = '{';
          let i = 0;
          for (const key in val) {
            if (val.hasOwnProperty(key)) {
              if (i++ > 0) {
                str += ',';
              }
              let json = stringify(val[key]);
              if (json !== undefined) {
                str += JSON.stringify(key) + ':' + json;
              }
            }
          }
          return str += '}';
        }

      case 'symbol':
      case 'undefined':
      case 'function':
        return undefined;

      case 'string':
      case 'boolean':
        return JSON.stringify(val);
    }
  };

  return stringify as (val: any) => string;
}
