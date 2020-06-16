const { seq } = require('./env');
const path = require('path');
const checkPrefix = (prefix, key) => {
  return prefix === '' ? key : prefix + seq + key;
};
exports.checkPrefix = checkPrefix;
const toObj = (prefix, obj, dataJson = {}) => {
  if (obj) {
    return Object.keys(obj).reduce((data, key) => {
      const val = obj[key];
      if (typeof val === 'string') {
        data[checkPrefix(prefix, key)] = val;
      } else {
        data = { ...data, ...toObj(checkPrefix(prefix, key), val, data) };
      }
      return data;
    }, dataJson);
  } else {
    return {};
  }
};
exports.toObj = toObj;
const toExpandJson = (data = {}, keys = [], parent = {}, index = 0, value) => {
  if (index === keys.length - 1) {
    return parent === undefined ? { [keys[index]]: value } : { ...parent, [keys[index]]: value };
  } else if (index === 0) {
    return { ...data, [keys[index]]: toExpandJson(data, keys, parent, index + 1, value) };
  } else {
    if (parent === undefined) {
      return { [keys[index]]: toExpandJson(data, keys, parent[keys[index]], index + 1, value) };
    } else {
      return { ...parent, [keys[index]]: toExpandJson(data, keys, parent[keys[index]], (index + 1), value) };
    }
  }
};
exports.toExpandJson = toExpandJson;
const fs = require('fs');

const writeFileRecursive = function(filePath, buffer) {
  let lastPath = filePath.substring(0, filePath.lastIndexOf(path.sep));
  fs.mkdir(lastPath, { recursive: true }, (err) => {
    if (err) {
      console.log(err);
    } else {
      fs.writeFileSync(filePath, buffer);
    }
  });
};
exports.writeFileRecursive = writeFileRecursive;
