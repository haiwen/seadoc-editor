const isChPunctuation = (char) => {
  // \u2014|\u2018|\u2019|\u201c|\u201d|
  // \u2026|
  // \u2039｜\u203a
  // \u3001|\u3002|\u3008|\u3009|\u300a|\u300b|\u300c|\u300d|\u300e|\u300f
  // \u3010|\u3011|\u3014|\u3015|\u301c|\u301d|\u301e
  // \ufe43|\ufe44|\ufe4f
  // \uffe5 (¥)
  const reg = /[\u2014|\u2018|\u2019|\u201c|\u201d|\u2026|\u2039|\u203a|\u3001|\u3002|\u3008|\u3009|\u300a|\u300b|\u300c|\u300d|\u300e|\u300f|\u3010|\u3011|\u3014|\u3015|\u301c|\u301d|\u301e]/;
  if (reg.test(char)){
    return true;
  } else {
    return false;
  }
};

function isEnHalfWidthPunctuation(char) {
  // Distribution of half-width punctuation points in unicode: 0x0021~0x007e
  // https://en.wikibooks.org/wiki/Unicode/Character_reference/0000-0FFF
  const reg = /[\x21-\x2f\x3a-\x40\x5b-\x60\x7B-\x7F]/;
  if (reg.test(char)){
    return true;
  } else {
    return false;
  }
}

function isEnFullWidthPunctuation(char) {
  // 0xff01~0xff5e
  // https://en.wikibooks.org/wiki/Unicode/Character_reference/F000-FFFF
  const reg = /[\uff01-\uff0f\uff1a-\uff1f\uff20\uff3b-\uff3f\uff40\uff5b-\uff5f]/;
  if (reg.test(char)){
    return true;
  } else {
    return false;
  }

}

const isLastCharPunctuation = (value) => {
  if (typeof value !== 'string' || !value) return false;
  const lastChar = value.slice(-1);

  if (isChPunctuation(lastChar)) return true;

  if (isEnHalfWidthPunctuation(lastChar)) return true;

  if (isEnFullWidthPunctuation(lastChar)) return true;

  return false;

};

export default isLastCharPunctuation;
