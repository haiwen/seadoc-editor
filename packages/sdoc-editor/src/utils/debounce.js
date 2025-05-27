/**
 * @param {Function} fn
 * @param {Number} delay
 */
const debounce = (fn, delay) => {
  let timeout = null;
  return function () {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      fn.apply(this, arguments);
    }, delay);
  };
};

export default debounce;
