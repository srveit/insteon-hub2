module.exports = {
  rules: {
    'max-nested-callbacks': [1, 9]
  },
  plugins: ['jest'],
  env: {
    'jest/globals': true
  }
};
