module.exports = {
    root: true,
    env: {
        node: true,
    },
    // extends: ["plugin:vue/essential", "@vue/prettier"],
    extends: ["plugin:eslint-plugin/recommended", "plugin:vue-libs/recommended"],
    rules: {
        "no-console": process.env.NODE_ENV === "production" ? "error" : "off",
        "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off",
        indent: ["error", 4],
        // "vue/max-attributes-per-line": [
        //     2,
        //     {
        //         line: 20,
        //         multiline: {
        //             max: 1,
        //             allowFirstLine: false,
        //         },
        //     },
        // ],
    },
    parserOptions: {
        parser: "babel-eslint",
    },
    plugins: ["eslint-plugin"],
};
