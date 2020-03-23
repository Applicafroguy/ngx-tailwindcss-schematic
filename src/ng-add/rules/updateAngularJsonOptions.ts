import { SchematicContext, Tree } from "@angular-devkit/schematics";
export function updateAngularJsonOptions(options: any) {
  return (_host: Tree, _context: SchematicContext) => {
    if (_host.exists("angular.json")) {
      const jsonStr = _host.read("angular.json")!.toString("utf-8");
      const json = JSON.parse(jsonStr);
      let builderJson =
        json["projects"][options.project]["architect"]["build"]["builder"];
      let optionsJson =
        json["projects"][options.project]["architect"]["build"]["options"];
      // Add Custom webpack build
      builderJson = "@angular-builders/custom-webpack:browser";
      // add custom webpack config
      optionsJson = {
        ...optionsJson,
        customWebpackConfig: {
          path: "./webpack.config.js"
        }
      };
      let serveJson = json["projects"][options.project]["architect"]["serve"];
      let serveOptionsJson =
        json["projects"][options.project]["architect"]["serve"]["options"];
      serveJson = "@angular-builders/custom-webpack:dev-server";
      serveOptionsJson = {
        ...serveOptionsJson,
        customWebpackConfig: {
          path: "./webpack.config.js"
        }
      };
      // save build changes
      json["projects"][options.project]["architect"]["build"] = {
        builder: builderJson,
        options: optionsJson
      };
      // write serve changes
      json["projects"][options.project]["architect"]["serve"] = {
        builder: serveJson,
        options: serveOptionsJson
      };
      _host.overwrite("angular.json", JSON.stringify(json, null, 2));
    } else {
      _context.logger.log("error", "angular.json does not exist");
    }
    return _host;
  };
}
