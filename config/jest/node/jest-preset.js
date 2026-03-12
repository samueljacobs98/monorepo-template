module.exports = {
  roots: ["<rootDir>"],
  transform: {
    "^.+\\.(ts|tsx|js|jsx)$": ["@swc/jest", { sourceMaps: "inline" }],
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  modulePathIgnorePatterns: [
    "<rootDir>/.*/__fixtures__",
    "<rootDir>/node_modules",
    "<rootDir>/dist",
  ],
  transformIgnorePatterns: ["/node_modules/(?!flat)"],
}
