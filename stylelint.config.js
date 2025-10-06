/** @type {import("stylelint").Config} */
export default {
  extends: ["stylelint-config-standard", "stylelint-config-recess-order"],
  plugins: ["stylelint-declaration-block-no-ignored-properties"],
  rules: {
    "selector-id-pattern": null,
    "selector-class-pattern": null,
    "keyframes-name-pattern": null,
    "scss/at-mixin-pattern": null,
    "scss/dollar-variable-pattern": null,
    "scss/percent-placeholder-pattern": null,
    "plugin/declaration-block-no-ignored-properties": true,
    // RSCSS記法に適合しないためOFF
    "no-descending-specificity": null,
  },
  ignoreFiles: ["./src/styles/reset.css"],
};
