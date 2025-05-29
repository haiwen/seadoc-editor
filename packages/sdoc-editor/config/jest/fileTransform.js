

const path = require('path');
const camelcase = require('camelcase');

// This is a custom Jest transformer turning file imports into filenames.
// http://facebook.github.io/jest/docs/en/webpack.html

module.exports = {
  process(sourceText, sourcePath, options) {
    return { code: 'module.exports = ' + JSON.stringify(path.basename(sourcePath)) + ';' };
  },
};
