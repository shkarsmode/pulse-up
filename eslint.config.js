// @ts-check
const eslint = require("@eslint/js");
const tseslint = require("typescript-eslint");
const angular = require("angular-eslint");
const rxjs = require("@smarttools/eslint-plugin-rxjs");
const typescriptESlintParser = require("@typescript-eslint/parser");

module.exports = tseslint.config(
    {
        files: ["**/*.ts"],
        languageOptions: {
            parser: typescriptESlintParser,
            parserOptions: {
                project: "./tsconfig.json",
                tsconfigRootDir: __dirname,
                sourceType: "module",
            },
        },
        ...rxjs.configs.recommended,
        // plugins: {
        //     rxjs,
        // },
    },
    // {
    //     files: ["**/*.ts"],
    //     extends: [
    //         eslint.configs.recommended,
    //         ...tseslint.configs.recommended,
    //         ...tseslint.configs.stylistic,
    //         ...angular.configs.tsRecommended,
    //     ],
    //     processor: angular.processInlineTemplates,
    //     rules: {
    //         "@angular-eslint/directive-selector": [
    //             "error",
    //             {
    //                 type: "attribute",
    //                 prefix: "app",
    //                 style: "camelCase",
    //             },
    //         ],
    //         "@angular-eslint/component-selector": [
    //             "error",
    //             {
    //                 type: "element",
    //                 prefix: "app",
    //                 style: "kebab-case",
    //             },
    //         ],
    //     },
    // },
    // {
    //     files: ["**/*.html"],
    //     extends: [...angular.configs.templateRecommended, ...angular.configs.templateAccessibility],
    //     rules: {},
    // },
);
