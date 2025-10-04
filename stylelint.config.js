/** @type {import("stylelint").Config} */
export default {
  extends: ["stylelint-config-standard", "stylelint-config-recess-order"],
  plugins: ["stylelint-declaration-block-no-ignored-properties"],
  rules: {
    "plugin/declaration-block-no-ignored-properties": true,
    // RSCSS記法に適合しないためOFF
    "no-descending-specificity": null,
  },
  ignoreFiles: ["./src/styles/reset.css"],
};
