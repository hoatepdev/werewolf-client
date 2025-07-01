/** @type {import('prettier').Config} */
// eslint-disable-next-line import/no-anonymous-default-export
export default {
  semi: false,
  singleQuote: true,
  trailingComma: "all",
  pluginSearchDirs: false,
  plugins: ["prettier-plugin-tailwindcss"],
  importOrder: ["^@", "^[a-zA-Z0-9-]+", "^[./]"],
};
