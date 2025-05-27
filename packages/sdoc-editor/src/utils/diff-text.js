import ObjectUtils from './object-utils';

const extendedWordChars = 'a-zA-Z\\u{C0}-\\u{FF}\\u{D8}-\\u{F6}\\u{F8}-\\u{2C6}\\u{2C8}-\\u{2D7}\\u{2DE}-\\u{2FF}\\u{1E00}-\\u{1EFF}\\u{4e00}-\\u{9fa5}';
const tokenizeIncludingWhitespace = new RegExp(`[${extendedWordChars}]+|\\s+|[^${extendedWordChars}]`, 'ug');

const buildValues = (diff, components, newString, oldString, valueType, useLongestToken) => {
  let componentPos = 0;
  let componentLen = components.length;
  let newPos = 0;
  let oldPos = 0;

  for (; componentPos < componentLen; componentPos++) {
    let component = components[componentPos];
    if (!component.removed) {
      if (!component.added && useLongestToken) {
        let value = newString.slice(newPos, newPos + component.count);
        // eslint-disable-next-line no-loop-func
        value = value.map((value, i) => {
          let oldValue = oldString[oldPos + i];
          return oldValue.length > value.length ? oldValue : value;
        });

        component.value = diff.join(value, valueType);
      } else {
        component.value = diff.join(newString.slice(newPos, newPos + component.count), valueType);
      }
      newPos += component.count;

      // Common case
      if (!component.added) {
        oldPos += component.count;
      }
    } else {
      component.value = diff.join(oldString.slice(oldPos, oldPos + component.count), valueType);
      oldPos += component.count;

      // Reverse add and remove so removes are output first to match common convention
      // The diffing algorithm is tied to add then remove output and this is the simplest
      // route to get the desired output with minimal overhead.
      if (componentPos && components[componentPos - 1].added) {
        let tmp = components[componentPos - 1];
        components[componentPos - 1] = components[componentPos];
        components[componentPos] = tmp;
      }
    }
  }

  // Special case handle for when one terminal is ignored (i.e. whitespace).
  // For this case we merge the terminal into the prior string and drop the change.
  // This is only available for string mode.
  let lastComponent = components[componentLen - 1];
  if (componentLen > 1
      && typeof lastComponent.value === 'string'
      && (lastComponent.added || lastComponent.removed)
      && diff.equals('', lastComponent.value)) {
    components[componentLen - 2].value += lastComponent.value;
    components.pop();
  }

  return components;
};

const clonePath = (path) => {
  return { newPos: path.newPos, components: path.components.slice(0) };
};

class DiffText {

  constructor(oldValue, newValue, options = {}) {

    this.oldValue = oldValue;
    this.newValue = newValue;
    const oldValueType = ObjectUtils.getDataType(oldValue);
    const newValueType = ObjectUtils.getDataType(newValue);
    this.canCompare = true;

    if (oldValueType !== newValueType) {
      this.canCompare = false;
      return;
    }

    this.valueType = newValueType;
    this.callback = options.callback;
    const optionsType = ObjectUtils.getDataType(options);
    if (optionsType === 'function') {
      this.callback = options;
      this.options = {};
    } else {
      this.options = {};
    }
    this.comparePath = 1;

    this.oldValue = this.removeEmpty(this.tokenize(oldValue, oldValueType), oldValueType);
    this.oldLen = this.oldValue.length;
    this.newValue = this.removeEmpty(this.tokenize(newValue, newValueType), newValueType);
    this.newLen = this.newValue.length;

    this.maxEditLength = this.newLen + this.oldLen;
    if (this.options.maxEditLength) {
      this.maxEditLength = Math.min(this.maxEditLength, this.options.maxEditLength);
    }

  }

  done = (value) => {
    if (this.callback) {
      setTimeout(function () {
        this.callback(undefined, value);
      }, 0);
      return true;
    }
    return value;
  };

  // Main worker method. checks all permutations of a given edit length for acceptance.
  execCompareLength = (bestPath) => {
    for (let diagonalPath = -1 * this.comparePath; diagonalPath <= this.comparePath; diagonalPath += 2) {
      let basePath;
      let addPath = bestPath[diagonalPath - 1];
      let removePath = bestPath[diagonalPath + 1];
      let oldPos = (removePath ? removePath.newPos : 0) - diagonalPath;
      if (addPath) {
        // No one else is going to attempt to use this value, clear it
        bestPath[diagonalPath - 1] = undefined;
      }

      let canAdd = addPath && addPath.newPos + 1 < this.newLen;
      let canRemove = removePath && 0 <= oldPos && oldPos < this.oldLen;
      if (!canAdd && !canRemove) {
        // If this path is a terminal then prune
        bestPath[diagonalPath] = undefined;
        continue;
      }

      // Select the diagonal that we want to branch from. We select the prior
      // path whose position in the new string is the farthest from the origin
      // and does not pass the bounds of the diff graph
      if (!canAdd || (canRemove && addPath.newPos < removePath.newPos)) {
        basePath = clonePath(removePath);
        this.pushComponent(basePath.components, undefined, true);
      } else {
        basePath = addPath; // No need to clone, we've pulled it from the list
        basePath.newPos++;
        this.pushComponent(basePath.components, true, undefined);
      }

      oldPos = this.extractCommon(basePath, this.newValue, this.oldValue, diagonalPath);

      // If we have hit the end of both strings, then we are done
      if (basePath.newPos + 1 >= this.newLen && oldPos + 1 >= this.oldLen) {
        return this.done(buildValues(this, basePath.components, this.newValue, this.oldValue, this.valueType, this.useLongestToken));
      } else {
        // Otherwise track this path as a potential candidate and continue.
        bestPath[diagonalPath] = basePath;
      }
    }

    this.comparePath++;
  };

  exec = (bestPath) => {
    setTimeout(function () {
      if (this.comparePath > this.maxEditLength) {
        return this.callback();
      }

      if (!this.execCompareLength(bestPath)) {
        this.exec(bestPath);
      }
    }, 0);
  };

  pushComponent = (components, added, removed) => {
    let last = components[components.length - 1];
    if (last && last.added === added && last.removed === removed) {
      // We need to clone here as the component clone operation is just
      // as shallow array clone
      components[components.length - 1] = { count: last.count + 1, added: added, removed: removed };
    } else {
      components.push({ count: 1, added: added, removed: removed });
    }
  };

  extractCommon = (basePath, newString, oldString, diagonalPath) => {
    let newLen = newString.length;
    let oldLen = oldString.length;
    let newPos = basePath.newPos;
    let oldPos = newPos - diagonalPath;
    let commonCount = 0;

    while (newPos + 1 < newLen && oldPos + 1 < oldLen && this.equals(newString[newPos + 1], oldString[oldPos + 1])) {
      newPos++;
      oldPos++;
      commonCount++;
    }

    if (commonCount) {
      basePath.components.push({ count: commonCount });
    }

    basePath.newPos = newPos;
    return oldPos;
  };

  equals = (left, right) => {
    if (this.options.ignoreCase) {
      left = left.toLowerCase();
      right = right.toLowerCase();
    }

    return left.trim() === right.trim();
  };

  removeEmpty = (array, type) => {
    if (type === 'Array') return array;
    let ret = [];
    for (let i = 0; i < array.length; i++) {
      if (array[i]) {
        ret.push(array[i]);
      }
    }
    return ret;
  };

  tokenize = (value, valueType) => {
    if (valueType === 'Array') {
      return value.slice();
    }

    let parts = value.match(tokenizeIncludingWhitespace) || [];
    const tokens = [];
    let prevPart = null;
    parts.forEach(part => {
      if ((/\s/).test(part)) {
        if (prevPart == null) {
          tokens.push(part);
        } else {
          tokens.push(tokens.pop() + part);
        }
      } else if ((/\s/).test(prevPart)) {
        if (tokens[tokens.length - 1] === prevPart) {
          tokens.push(tokens.pop() + part);
        } else {
          tokens.push(prevPart + part);
        }
      } else {
        tokens.push(part);
      }

      prevPart = part;
    });
    return tokens;
  };

  join = (value, valueType) => {
    if (valueType === 'Array') return value;
    // Tokens being joined here will always have appeared consecutively in the
    // same text, so we can simply strip off the leading whitespace from all the
    // tokens except the first (and except any whitespace-only tokens - but such
    // a token will always be the first and only token anyway) and then join them
    // and the whitespace around words and punctuation will end up correct.
    return value.map((token, i) => {
      if (i === 0) {
        return token;
      } else {
        return token.replace((/^\s+/), '');
      }
    }).join('');
  };

  getDiffs = () => {

    if (!this.canCompare) {
      return [
        { value: this.oldValue, removed: true },
        { value: this.newValue, added: true }
      ];
    }

    let bestPath = [{ newPos: -1, components: [] }];

    // Seed editLength = 0, i.e. the content starts with the same values
    let oldPos = this.extractCommon(bestPath[0], this.newValue, this.oldValue, 0);
    if (bestPath[0].newPos + 1 >= this.newLen && oldPos + 1 >= this.oldLen) {
      // Identity per the equality and tokenizer
      return this.done([{ value: this.join(this.newValue, this.valueType), count: this.oldValue.length }]);
    }

    // Performs the length of edit iteration. Is a bit fugly as this has to support the
    // sync and async mode which is never fun. Loops over execCompareLength until a value
    // is produced, or until the edit length exceeds options.maxEditLength (if given),
    // in which case it will return undefined.
    if (this.callback) {
      this.exec(bestPath);
    } else {
      while (this.comparePath <= this.maxEditLength) {
        let ret = this.execCompareLength(bestPath);
        if (ret) {
          return ret;
        }
      }
    }
  };

}

export default DiffText;
