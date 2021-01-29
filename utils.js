/**
 * Utility methods
 */

const fs = require("fs");

const parseUrlParams = (url) => {
  return JSON.parse(
    '{"' +
      decodeURI(url.split("?")[1])
        .replace(/"/g, '\\"')
        .replace(/&/g, '","')
        .replace(/=/g, '":"') +
      '"}'
  );
};

const writeDataToFile = (data, filename) => {
  return new Promise((resolve, reject) => {
    fs.appendFile(filename, data, function (err) {
      console.log(`\twrote ${data.length} bytes to ${filename}`);
      if (err) {
        console.log(`\twrite failed for ${filename}`);
        reject(err);
      }
      resolve();
    });
  });
};

module.exports = {
  parseUrlParams,
  writeDataToFile,
};
