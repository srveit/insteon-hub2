module.exports = {
  "extends": [
    "eslint:recommended"
  ],
  "parserOptions": {
    "ecmaVersion": 2017
  },
  "env": {
    "node": true,
    "es6": true
  },
  "rules": {
 //
    //Possible Errors
    //
    // The following rules point out areas where you might have made mistakes.
    //
    "comma-dangle": "error", // disallow or enforce trailing commas
    "no-cond-assign": "error", // disallow assignment in conditional expressions
    "no-console": "error", // disallow use of console (off by default in the node environment)
    "no-constant-condition": "error", // disallow use of constant expressions in conditions
    "no-control-regex": "error", // disallow control characters in regular expressions
    "no-debugger": "error", // disallow use of debugger
    "no-dupe-args": "error", // disallow duplicate arguments in functions
    "no-dupe-keys": "error", // disallow duplicate keys when creating object literals
    "no-duplicate-case": "error", // disallow a duplicate case label.
    "no-empty": "error", // disallow empty statements
    "no-empty-character-class": "error", // disallow the use of empty character classes in regular expressions
    "no-ex-assign": "error", // disallow assigning to the exception in a catch block
    "no-extra-boolean-cast": "error", // disallow double-negation boolean casts in a boolean context
    "no-extra-parens": "off", // disallow unnecessary parentheses (off by default)
    "no-extra-semi": "error", // disallow unnecessary semicolons
    "no-func-assign": "error", // disallow overwriting functions written as function declarations
    "no-inner-declarations": "error", // disallow function or variable declarations in nested blocks
    "no-invalid-regexp": "error", // disallow invalid regular expression strings in the RegExp constructor
    "no-irregular-whitespace": "error", // disallow irregular whitespace outside of strings and comments
    "no-negated-in-lhs": "error", // disallow negation of the left operand of an in expression
    "no-obj-calls": "error", // disallow the use of object properties of the global object (Math and JSON) as functions
    "no-regex-spaces": "error", // disallow multiple spaces in a regular expression literal
    "no-sparse-arrays": "error", // disallow sparse arrays
    "no-unreachable": "error", // disallow unreachable statements after a return, throw, continue, or break statement
    "use-isnan": "error", // disallow comparisons with the value NaN
    "valid-jsdoc": "error", // Ensure JSDoc comments are valid (off by default)
    "valid-typeof": "error", // Ensure that the results of typeof are compared against a valid string

    //
    // Best Practices
    //
    // These are rules designed to prevent you from making mistakes.
    // They either prescribe a better way of doing something or help you avoid footguns.
    //
    "block-scoped-var": "off", // treat var statements as if they were block scoped (off by default). "off": deep destructuring is not compatible https://github.com/eslint/eslint/issues/1863
    "complexity": "off", // specify the maximum cyclomatic complexity allowed in a program (off by default)
    "consistent-return": "error", // require return statements to either always or never specify values
    "curly": "error", // specify curly brace conventions for all control statements
    "default-case": "error", // require default case in switch statements (off by default)
    "dot-notation": "error", // encourages use of dot notation whenever possible
    "eqeqeq": "error", // require the use of === and !==
    "guard-for-in": "error", // make sure for-in loops have an if statement (off by default)
    "no-alert": "error", // disallow the use of alert, confirm, and prompt
    "no-caller": "error", // disallow use of arguments.caller or arguments.callee
    "no-div-regex": "error", // disallow division operators explicitly at beginning of regular expression (off by default)
    "no-else-return": "error", // disallow else after a return in an if (off by default)
    "no-eq-null": "error", // disallow comparisons to null without a type-checking operator (off by default)
    "no-eval": "error", // disallow use of eval()
    "no-extend-native": "error", // disallow adding to native types
    "no-extra-bind": "error", // disallow unnecessary function binding
    "no-fallthrough": "error", // disallow fallthrough of case statements
    "no-floating-decimal": "error", // disallow the use of leading or trailing decimal points in numeric literals (off by default)
    "no-implied-eval": "error", // disallow use of eval()-like methods
    "no-iterator": "error", // disallow usage of __iterator__ property
    "no-labels": "error", // disallow use of labeled statements
    "no-lone-blocks": "error", // disallow unnecessary nested blocks
    "no-loop-func": "error", // disallow creation of functions within loops
    "no-multi-spaces": "error", // disallow use of multiple spaces
    "no-multi-str": "error", // disallow use of multiline strings
    "no-native-reassign": "error", // disallow reassignments of native objects
    "no-new": "error", // disallow use of new operator when not part of the assignment or comparison
    "no-new-func": "error", // disallow use of new operator for Function object
    "no-new-wrappers": "error", // disallows creating new instances of String,Number, and Boolean
    "no-octal": "error", // disallow use of octal literals
    "no-octal-escape": "error", // disallow use of octal escape sequences in string literals, such as var foo = "Copyright \251";
    "no-param-reassign": "error", // disallow reassignment of function parameters (off by default)
    "no-process-env": "error", // disallow use of process.env (off by default)
    "no-proto": "error", // disallow usage of __proto__ property
    "no-redeclare": "error", // disallow declaring the same variable more then once
    "no-return-assign": "error", // disallow use of assignment in return statement
    "no-script-url": "error", // disallow use of javascript: urls.
    "no-self-compare": "error", // disallow comparisons where both sides are exactly the same (off by default)
    "no-sequences": "error", // disallow use of comma operator
    "no-throw-literal": "error", // restrict what can be thrown as an exception (off by default)
    "no-unused-expressions": "error", // disallow usage of expressions in statement position
    "no-void": "error", // disallow use of void operator (off by default)
    "no-warning-comments": ["off", {"terms": ["todo", "fixme"], "location": "start"}], // disallow usage of configurable warning terms in comments": "error", // e.g. TODO or FIXME (off by default)
    "no-with": "error", // disallow use of the with statement
    "radix": "error", // require use of the second argument for parseInt() (off by default)
    "vars-on-top": "error", // requires to declare all vars on top of their containing scope (off by default)
    "wrap-iife": "error", // require immediate function invocation to be wrapped in parentheses (off by default)
    "yoda": "error", // require or disallow Yoda conditions

    //
    // Strict Mode
    //
    // These rules relate to using strict mode.
    //
    "strict": "off", // controls location of Use Strict Directives. "off": required by `babel-eslint`

    //
    // Variables
    //
    // These rules have to do with variable declarations.
    //
    "no-catch-shadow": "error", // disallow the catch clause parameter name being the same as a variable in the outer scope (off by default in the node environment)
    "no-delete-var": "error", // disallow deletion of variables
    "no-label-var": "error", // disallow labels that share a name with a variable
    "no-shadow": "error", // disallow declaration of variables already declared in the outer scope
    "no-shadow-restricted-names": "error", // disallow shadowing of names such as arguments
    "no-undef": "error", // disallow use of undeclared variables unless mentioned in a /*global */ block
    "no-undef-init": "error", // disallow use of undefined when initializing variables
    "no-undefined": "error", // disallow use of undefined variable (off by default)
    "no-unused-vars": "error", // disallow declaration of variables that are not used in the code
    "no-use-before-define": "error", // disallow use of variables before they are defined

    //
    //Stylistic Issues
    //
    // These rules are purely matters of style and are quite subjective.
    //
    "indent": ["error", 2], // this option sets a specific tab width for your code (off by default)
    "brace-style": "error", // enforce one true brace style (off by default)
    "camelcase": "error", // require camel case names
    "comma-spacing": ["error", {"before": false, "after": true}], // enforce spacing before and after comma
    "comma-style": ["error", "last"], // enforce one true comma style (off by default)
    "consistent-this": ["error", "_this"], // enforces consistent naming when capturing the current execution context (off by default)
    "eol-last": "error", // enforce newline at the end of file, with no multiple empty lines
    "func-names": "off", // require function expressions to have a name (off by default)
    "func-style": "off", // enforces use of function declarations or expressions (off by default)
    "key-spacing": ["error", {"beforeColon": false, "afterColon": true}], // enforces spacing between keys and values in object literal properties
    "max-nested-callbacks": ["error", 3], // specify the maximum depth callbacks can be nested (off by default)
    "new-cap": ["error", {newIsCap: true, capIsNew: false}], // require a capital letter for constructors
    "new-parens": "error", // disallow the omission of parentheses when invoking a constructor with no arguments
    "newline-after-var": "off", // allow/disallow an empty newline after var statement (off by default)
    "no-array-constructor": "error", // disallow use of the Array constructor
    "no-inline-comments": "error", // disallow comments inline after code (off by default)
    "no-lonely-if": "error", // disallow if as the only statement in an else block (off by default)
    "no-mixed-spaces-and-tabs": "error", // disallow mixed spaces and tabs for indentation
    "no-multiple-empty-lines": ["error", {"max": 2}], // disallow multiple empty lines (off by default)
    "no-nested-ternary": "error", // disallow nested ternary expressions (off by default)
    "no-new-object": "error", // disallow use of the Object constructor
    "no-spaced-func": "error", // disallow space between function identifier and application
    "no-ternary": "off", // disallow the use of ternary operators (off by default)
    "no-trailing-spaces": "error", // disallow trailing whitespace at the end of lines
    "no-underscore-dangle": "error", // disallow dangling underscores in identifiers
    "one-var": ["error", "always"], // allow just one var statement per function (off by default)
    "operator-assignment": ["error", "never"], // require assignment operator shorthand where possible or prohibit it entirely (off by default)
    "padded-blocks": ["error", "never"], // enforce padding within blocks (off by default)
    "quote-props": ["error", "as-needed"], // require quotes around object literal property names (off by default)
    "quotes": ["error", "single"], // specify whether double or single quotes should be used
    "semi": ["error", "always"], // require or disallow use of semicolons instead of ASI
    "semi-spacing": ["error", {"before": false, "after": true}], // enforce spacing before and after semicolons
    "sort-vars": "off", // sort variables within the same declaration block (off by default)
    "keyword-spacing": ["error", {"before": true, "after": true}], // require a space after certain keywords (off by default)
    "space-before-blocks": ["error", "always"], // require or disallow space before blocks (off by default)
    "space-before-function-paren": ["error", {"anonymous": "always", "named": "never"}], // require or disallow space before function opening parenthesis (off by default)
    "object-curly-spacing": ["error"],
    "array-bracket-spacing": ["error"],
    "computed-property-spacing": ["error"],
    "space-in-parens": ["error", "never"], // require or disallow spaces inside parentheses (off by default)
    "space-infix-ops": ["error", {"int32Hint": false}], // require spaces around operators
    "space-unary-ops": ["error", {"words": true, "nonwords": false}], // Require or disallow spaces before/after unary operators (words on by default, nonwords off by default)
    "spaced-comment": ["error", "always"], // require or disallow a space immediately following the // in a line comment (off by default)
    "wrap-regex": "off", // require regex literals to be wrapped in parentheses (off by default)

    //
    // ECMAScript 6
    //
    // These rules are only relevant to ES6 environments and are off by default.
    //
    "no-var": "error", // require let or const instead of var (off by default)
    "generator-star-spacing": ["error", "before"], // enforce the spacing around the * in generator functions (off by default)

    //
    // Legacy
    //
    // The following rules are included for compatibility with JSHint and JSLint.
    // While the names of the rules may not match up with the JSHint/JSLint counterpart,
    // the functionality is the same.
    //
    "max-depth": ["error", 3], // specify the maximum depth that blocks can be nested (off by default)
    "max-len": ["error", 100, 2], // specify the maximum length of a line in your program (off by default)
    "max-params": ["error", 5], // limits the number of parameters that can be used in the function declaration. (off by default)
    "max-statements": "off", // specify the maximum number of statement allowed in a function (off by default)
    "no-bitwise": "off", // disallow use of bitwise operators (off by default)
    "no-plusplus": "error", // disallow use of unary operators, ++ and -- (off by default)
    "prefer-const": ["error", {"destructuring": "all"}]
  }
};
