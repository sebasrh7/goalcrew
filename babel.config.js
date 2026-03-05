module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          root: ["./"],
          alias: {
            "@": "./src",
            "@components": "./src/components",
            "@screens": "./src/screens",
            "@hooks": "./src/hooks",
            "@store": "./src/store",
            "@lib": "./src/lib",
            "@types": "./src/types",
            "@constants": "./src/constants",
          },
        },
      ],
      // Transform import.meta.env → { MODE: process.env.NODE_ENV } so that
      // libraries like zustand work in regular <script> tags on web.
      function importMetaEnvPlugin({ types: t }) {
        return {
          visitor: {
            MemberExpression(path) {
              // Match: import.meta.env
              const { node } = path;
              if (
                !node.computed &&
                t.isMemberExpression(node.object) &&
                t.isMetaProperty(node.object.object) &&
                node.object.object.meta.name === "import" &&
                node.object.object.property.name === "meta" &&
                t.isIdentifier(node.object.property, { name: "env" })
              ) {
                // import.meta.env.MODE → process.env.NODE_ENV
                if (t.isIdentifier(node.property, { name: "MODE" })) {
                  path.replaceWith(
                    t.memberExpression(
                      t.memberExpression(
                        t.identifier("process"),
                        t.identifier("env"),
                      ),
                      t.identifier("NODE_ENV"),
                    ),
                  );
                }
              } else if (
                t.isMetaProperty(node.object) &&
                node.object.meta.name === "import" &&
                node.object.property.name === "meta" &&
                t.isIdentifier(node.property, { name: "env" })
              ) {
                // import.meta.env → { MODE: process.env.NODE_ENV }
                path.replaceWith(
                  t.objectExpression([
                    t.objectProperty(
                      t.identifier("MODE"),
                      t.memberExpression(
                        t.memberExpression(
                          t.identifier("process"),
                          t.identifier("env"),
                        ),
                        t.identifier("NODE_ENV"),
                      ),
                    ),
                  ]),
                );
              }
            },
          },
        };
      },
      "react-native-reanimated/plugin",
    ],
  };
};
