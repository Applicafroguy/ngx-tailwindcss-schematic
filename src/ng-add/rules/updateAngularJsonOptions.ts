import { SchematicContext, Tree } from "@angular-devkit/schematics";
export function updateAngularJsonOptions(options: any) {
  return (_host: Tree, _context: SchematicContext) => {
    if (_host.exists("angular.json")) {
      const jsonStr = _host.read("angular.json")!.toString("utf-8");
      const json = JSON.parse(jsonStr);

      // Store Builder Architect
      let builderJson =
        json["projects"][options.project]["architect"]["build"]["builder"];

      // Store Builder Options
      let optionsJson =
        json["projects"][options.project]["architect"]["build"]["options"];

        // Store Builder Configurations
        let configurationsJson =
        json["projects"][options.project]["architect"]["configurations"];

      // Add Custom webpack build
      builderJson = "@angular-builders/custom-webpack:browser";

      // add custom webpack config
      optionsJson = {
        ...optionsJson,
        customWebpackConfig: {
          path: "./webpack.config.js"
        }
      };

      // Store Serve
      let serveJson = json["projects"][options.project]["architect"]["serve"];

      // Store Serve Options
      let serveOptionsJson =
        json["projects"][options.project]["architect"]["serve"]["options"];

        // Store Serve Configurations
        let serveConfigurations = json["projects"][options.project]["architect"]["serve"]["configurations"];
      serveJson = "@angular-builders/custom-webpack:dev-server";
      serveOptionsJson = {
        ...serveOptionsJson,
        customWebpackConfig: {
          path: "./webpack.config.js"
        }
      };

      /**
       * Write to angular.json
       */

      // save build changes
      json["projects"][options.project]["architect"]["build"] = {
        builder: builderJson,
        options: optionsJson,
        configurations: configurationsJson
      };

      // write serve changes
      json["projects"][options.project]["architect"]["serve"] = {
        builder: serveJson,
        options: serveOptionsJson,
        configurations: serveConfigurations
      };

      _host.overwrite("angular.json", JSON.stringify(json, null, 2));
    } else {
      _context.logger.log("error", "angular.json does not exist");
    }
    return _host;
  };
}
