const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = (env) => {
  const baseConfig = {
    context: path.resolve(__dirname),
    mode: env.production ? "production" : "development",
    entry: env.production ? "./src/index.ts" : "./src/example/index.ts",
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: env.production ? "domb.js" : "domb-ex.js",
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: [
            {
              loader: "ts-loader",
              options: {
                configFile: path.resolve(__dirname, env.production ? "./tsconfig.prod.json" : "./tsconfig.json"),
              },
            },
          ],
          exclude: /node_modules/,
          //include: [path.resolve(__dirname, env.production ? "src/main" : "src")],
        },
      ],
    },
    resolve: {
      extensions: [".ts", ".js"],
    },
  };

  if (env.production) {
    return baseConfig;
  } else {
    return {
      ...baseConfig,
      plugins: [
        new HtmlWebpackPlugin({
          title: "Domb.js example",
          template: "./src/example/index.html",
        }),
      ],
      devServer: {
        contentBase: "./dist",
      },
    };
  }
};
