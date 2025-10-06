/** @type {import("stylelint").Config} */
export default {
  extends: ["stylelint-config-standard", "stylelint-config-recess-order"],
  plugins: ["stylelint-declaration-block-no-ignored-properties"],
  rules: {
    "selector-id-pattern": null,
    "selector-class-pattern": null,
    "keyframes-name-pattern": null,
    "plugin/declaration-block-no-ignored-properties": true,
    "no-descending-specificity": null,
  },
  ignoreFiles: ["./src/styles/reset.css"],
};
