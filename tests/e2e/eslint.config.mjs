import cypress from "eslint-plugin-cypress";
import globals from "globals";

export default [{
    plugins: {
        cypress,
    },

    languageOptions: {
        globals: {
            ...globals.mocha,
            ...cypress.environments.globals.globals,
        },
    },

    rules: {
        strict: "off",
    },
}];