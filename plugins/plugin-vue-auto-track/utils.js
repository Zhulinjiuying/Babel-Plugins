function checkValueInArray(value = '', array = []) {
  return array.some((item => item === value));
}

module.exports = {
  checkValueInArray,
};
