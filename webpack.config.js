import path from "path";

const config = {
  target: ["node"],
  mode: "production",

  entry: {
    index: "./src/app.ts",
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "ts-loader",
        options: {
          transpileOnly: true,
        },
        exclude: /node_modules/,
      },
    ],
    parser: {
      javascript: {
        importMeta: false,
      },
    },
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  output: {
    chunkFormat: "module",
    filename: "[name].js",
    path: path.resolve("dist/"),
  },
  experiments: {
    outputModule: true,
  },
};

export default config;
