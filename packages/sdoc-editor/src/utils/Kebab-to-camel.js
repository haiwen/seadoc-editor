const KebabToCamel = (str) => {
  return str.replace(/(_[a-z])/g,
    (match) => `${match.slice(1).toUpperCase()}`);
};

export default KebabToCamel;
