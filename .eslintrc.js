module.exports = {
  "env": {
    "browser": true,
    "es6": true,
    "node": true
  },
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "sourceType": "module"
  },
  "plugins": [
    "@typescript-eslint"
  ],
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  "rules": {
    "no-redeclare": "off",
    "@typescript-eslint/no-redeclare": "off",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/member-delimiter-style": "off",
    "@typescript-eslint/ban-ts-ignore": "off",
    "@typescript-eslint/camelcase": "off",
    "@typescript-eslint/interface-name-prefix": "off",
    "@typescript-eslint/adjacent-overload-signatures": "error",
    "@typescript-eslint/array-type": "error",
    "@typescript-eslint/ban-types": "off",
    "@typescript-eslint/class-name-casing": "off",
    "@typescript-eslint/consistent-type-assertions": "off",
    "@typescript-eslint/explicit-member-accessibility": [
      "off",
      {
        "accessibility": "explicit"
      }
    ],
    "@typescript-eslint/indent": [
      "error",
      2,
      {
        "ObjectExpression": "first",
        "FunctionDeclaration": {
          "parameters": "first"
        },
        "FunctionExpression": {
          "parameters": "first"
        }
      }
    ],
    "@typescript-eslint/member-ordering": "off",
    "@typescript-eslint/no-empty-function": "error",
    "@typescript-eslint/no-empty-interface": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-misused-new": "error",
    "@typescript-eslint/no-namespace": "error",
    "@typescript-eslint/no-parameter-properties": "off",
    "@typescript-eslint/no-this-alias": "error",
    "@typescript-eslint/no-use-before-define": "off",
    "@typescript-eslint/no-var-requires": "error",
    "@typescript-eslint/prefer-for-of": "off",
    "@typescript-eslint/prefer-function-type": "error",
    "@typescript-eslint/prefer-namespace-keyword": "error",
    "@typescript-eslint/quotes": "off",
    "@typescript-eslint/semi": [
      "error",
      "always"
    ],
    "@typescript-eslint/triple-slash-reference": "error",
    "@typescript-eslint/unified-signatures": "off",
    "arrow-parens": [
      "off",
      "as-needed"
    ],
    "camelcase": "off",
    "comma-dangle": "off",
    "complexity": "off",
    "constructor-super": "error",
    "curly": "off",
    "dot-notation": "error",
    "eqeqeq": [
      "error",
      "smart"
    ],
    "guard-for-in": "error",
    "id-blacklist": "off",
    "id-match": "off",
    "import/no-extraneous-dependencies": "off",
    "import/no-internal-modules": "off",
    "import/order": "off",
    "max-classes-per-file": [
      "error",
      2
    ],
    "new-parens": "error",
    "no-bitwise": "off",
    "no-caller": "error",
    "no-cond-assign": "error",
    "no-console": "error",
    "no-debugger": "error",
    "no-duplicate-case": "error",
    "no-duplicate-imports": "error",
    "no-empty": "error",
    "no-eval": "error",
    "no-extra-bind": "error",
    "no-fallthrough": "off",
    "no-invalid-this": "off",
    "no-new-func": "error",
    "no-new-wrappers": "off",
    "no-return-await": "error",
    "no-sequences": "error",
    "no-shadow": [
      "error",
      {
        "hoist": "all"
      }
    ],
    "no-sparse-arrays": "error",
    "no-template-curly-in-string": "error",
    "no-throw-literal": "error",
    "no-trailing-spaces": "off",
    "no-undef-init": "error",
    "no-underscore-dangle": "off",
    "no-unsafe-finally": "error",
    "no-unused-expressions": "error",
    "no-unused-labels": "error",
    "no-var": "error",
    "object-shorthand": "error",
    "one-var": [
      "off",
      "never"
    ],
    "prefer-arrow/prefer-arrow-functions": "off",
    "prefer-const": "error",
    "prefer-object-spread": "error",
    "quote-props": "off",
    "radix": "error",
    "space-before-function-paren": "off",
    "space-in-parens": "off",
    "spaced-comment": "error",
    "use-isnan": "error",
    "valid-typeof": "off",
  }
};
