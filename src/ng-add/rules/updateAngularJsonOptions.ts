import { SchematicContext, Tree, SchematicsException } from "@angular-devkit/schematics";
import { Schema } from "../schema";

export function updateAngularJsonOptions(options: Schema) {
  return (_host: Tree, _context: SchematicContext) => {
    if (_host.exists("angular.json")) {

      // Read angular.json
      const angularJSON = _host.read("angular.json")!.toString("utf-8");

      // Check if  is an angular cli workspace
      if (!angularJSON) {
        throw new SchematicsException("Not an Angular CLI workspace");
      }

      // Get angular workspace
      const workspace = JSON.parse(angularJSON);

      // Get Project name
      const projectName = options.project || workspace.defaultProject;


      _context.logger.log("info", `✅️ Adding Tailwindcss to ${projectName} project`);

      // Get project
      const project = workspace.projects[projectName];

      // Get SRC Path
      const srcPath = project['sourceRoot'];

      // Store Builder Architect
      let builderJson =
        project["architect"]["build"]["builder"];

      // Store Builder Options
      let optionsJson =
        project["architect"]["build"]["options"];

      // Store Builder Configurations
      let configurationsJson =
        project["architect"]["build"]["configurations"];

      // Add Custom webpack build
      builderJson = "@angular-builders/custom-webpack:browser";

      // add custom webpack config to build
      optionsJson = {
        ...optionsJson,
        customWebpackConfig: {
          path: "./webpack.config.js"
        }
      };


      // Store Serve Options
      let serveOptionsJson = project["architect"]["serve"]["options"];

      // Store Serve Configurations
      let serveConfigurations = project["architect"]["serve"]["configurations"];
      let serveJson = "@angular-builders/custom-webpack:dev-server";
      serveOptionsJson = {
        ...serveOptionsJson
      };

      // Add tailwindcss style
      const styles: string[] = optionsJson['styles'];
      styles.push(`${srcPath}/tailwind/tailwind.scss`);
      optionsJson['styles'] = styles;

      /**
       * Write to angular.json
       */

      // save build changes
      project["architect"]["build"] = {
        builder: builderJson,
        options: optionsJson,
        configurations: configurationsJson
      };

      // write serve changes
      project["architect"]["serve"] = {
        builder: serveJson,
        options: serveOptionsJson,
        configurations: serveConfigurations
      };

      _host.overwrite("angular.json", JSON.stringify(workspace, null, 2));
    } else {
      _context.logger.log("error", "angular.json does not exist");
    }
    return _host;
  };
}
