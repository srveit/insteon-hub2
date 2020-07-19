module.exports = {
  "rules": {
    "max-nested-callbacks": [1, 4] // specify the maximum depth callbacks can be nested (off by default)
  },
  "plugins": ["jest"],
  "env": {
    "jest/globals": true
  }
};
