/*
👋 Hi! This file was autogenerated by tslint-to-eslint-config.
https://github.com/typescript-eslint/tslint-to-eslint-config

It represents the closest reasonable ESLint configuration to this
project's original TSLint configuration.

We recommend eventually switching this configuration to extend from
the recommended rulesets in typescript-eslint. 
https://github.com/typescript-eslint/tslint-to-eslint-config/blob/master/docs/FAQs.md

Happy linting! 💖
*/
module.exports = {
    "env": {
        "browser": true,
        "es6": true,
        "node": true
    },
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "project": "tsconfig.json",
        "sourceType": "module"
    },
    "plugins": [
        "eslint-plugin-import",
        "@typescript-eslint",
        "@typescript-eslint/tslint"
    ],
    "rules": {
        "@typescript-eslint/await-thenable": "error",
        // "@typescript-eslint/indent": "error",
        "@typescript-eslint/member-delimiter-style": [
            "off",
            {
                "multiline": {
                    "delimiter": "semi",
                    "requireLast": true
                },
                "singleline": {
                    "delimiter": "semi",
                    "requireLast": false
                }
            }
        ],
        // "@typescript-eslint/naming-convention": "error",
        "@typescript-eslint/no-for-in-array": "error",
        "@typescript-eslint/no-misused-new": "error",
        "@typescript-eslint/no-non-null-assertion": "off",
        "@typescript-eslint/no-unused-expressions": "error",
        "@typescript-eslint/prefer-namespace-keyword": "error",
        "@typescript-eslint/quotes": [
            "off",
            "double"
        ],
        "@typescript-eslint/semi": [
            "off",
            "always"
        ],
        "@typescript-eslint/triple-slash-reference": [
            "error",
            {
                "path": "always",
                "types": "prefer-import",
                "lib": "always"
            }
        ],
        "@typescript-eslint/type-annotation-spacing": "error",
        // "brace-style": [
        //     "error",
        //     "1tbs"
        // ],
        "constructor-super": "error",
        "eqeqeq": [
            "off",
            "smart"
        ],
        "id-blacklist": [
            "error",
            "any",
            "Number",
            "number",
            "String",
            "string",
            "Boolean",
            "boolean",
            "Undefined",
            "undefined"
        ],
        "id-match": "error",
        "import/no-internal-modules": "error",
        "import/no-unassigned-import": "error",
        "no-caller": "error",
        "no-cond-assign": "error",
        "no-control-regex": "error",
        "no-duplicate-case": "error",
        "no-eval": "error",
        "no-invalid-regexp": "error",
        "no-octal": "error",
        "no-octal-escape": "error",
        "no-redeclare": "error",
        "no-regex-spaces": "error",
        "no-sparse-arrays": "error",
        "no-template-curly-in-string": "error",
        "no-throw-literal": "error",
        "no-trailing-spaces": [
            "error",
            {
                "ignoreComments": true
            }
        ],
        // "no-underscore-dangle": "error",
        "no-unsafe-finally": "error",
        "no-unused-labels": "error",
        "no-var": "error",
        "spaced-comment": [
            "off",
            "always",
            {
                "markers": [
                    "/"
                ]
            }
        ],
        "use-isnan": "error",
        "@typescript-eslint/tslint/config": [
            "error",
            {
                "rules": {
                    "jquery-deferred-must-complete": true,
                    "match-default-export-name": true,
                    "mocha-avoid-only": true,
                    "mocha-no-side-effect-code": true,
                    "no-delete-expression": true,
                    "no-disable-auto-sanitization": true,
                    "no-document-domain": true,
                    "no-document-write": true,
                    "no-exec-script": true,
                    "no-function-constructor-with-string-args": true,
                    "no-http-string": [
                        true,
                        "http://www.w3.org/?.*"
                    ],
                    "no-inner-html": true,
                    "no-jquery-raw-elements": true,
                    "no-string-based-set-immediate": true,
                    "no-string-based-set-interval": true,
                    "no-string-based-set-timeout": true,
                    "no-unnecessary-bind": true,
                    "no-unnecessary-override": true,
                    "no-unsupported-browser-code": true,
                    "no-with-statement": true,
                    "non-literal-require": true,
                    "possible-timing-attack": true,
                    "react-a11y-anchors": true,
                    "react-a11y-aria-unsupported-elements": true,
                    "react-a11y-event-has-role": true,
                    "react-a11y-image-button-has-alt": true,
                    "react-a11y-img-has-alt": true,
                    "react-a11y-lang": true,
                    "react-a11y-meta": true,
                    "react-a11y-props": true,
                    "react-a11y-proptypes": true,
                    "react-a11y-role": true,
                    "react-a11y-role-has-required-aria-props": true,
                    "react-a11y-role-supports-aria-props": true,
                    "react-a11y-tabindex-no-positive": true,
                    "react-a11y-titles": true,
                    "react-anchor-blank-noopener": true,
                    "react-iframe-missing-sandbox": true,
                    "react-no-dangerous-html": true,
                    "react-this-binding-issue": true,
                    "react-unused-props-and-state": true,
                    "whitespace": [
                        true,
                        "check-branch",
                        "check-decl",
                        "check-operator",
                        "check-type"
                    ]
                }
            }
        ]
    }
};
