module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "build",
        "chore",
        "ci",
        "docs",
        "feat",
        "fix",
        "perf",
        "refactor",
        "revert",
        "style",
        "test",
      ],
    ],
    // Require scope to be present
    "scope-empty": [2, "never"],
    // Enforce specific scopes (your custom labels)
    // Scope must be one of the listed values
    "scope-enum": [
      2,
      "always",
      [
        // Add your custom labels here!
        "api",
        "web",
        "backend",
        "front-end",
      ],
    ],
  },
};
