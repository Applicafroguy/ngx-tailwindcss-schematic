import {
  chain,
  Rule,
  SchematicContext,
  Tree,
  mergeWith,
  template,
  url,
  apply
} from "@angular-devkit/schematics";
import { NodePackageInstallTask } from "@angular-devkit/schematics/tasks";
import {
  addPackageJsonDependency,
  NodeDependency,
  NodeDependencyType
} from "@schematics/angular/utility/dependencies";
import { getWorkspace } from "@schematics/angular/utility/config";
import { Observable, of } from "rxjs";
import { concatMap, map } from "rxjs/operators";
import { getLatestNodeVersion, NpmRegistryPackage } from "../util/npmjs";
import { getProjectStyleFile } from "../util/style-file";
import { getProjectFromWorkspace } from "@angular/cdk/schematics";

export default function(_options: any): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    return chain([
      addPackageJsonDependencies(),
      addTailwindCSSStyles(_options),
      installDependencies(),
      mergeWith(
        apply(url("./files"), [
          template({
            INDEX: _options.index,
            name: _options.name
          })
        ])
      ),
      updateAngularJsonOptions(_options)
    ])(tree, _context);
  };
}

// Adds Packages
function addPackageJsonDependencies(): Rule {
  return (tree: Tree, _context: SchematicContext): Observable<Tree> => {
    return of(
      "tailwind",
      "postcss-scss",
      "postcss-import",
      "postcss-loader",
      "@angular-builders/custom-webpack"
    ).pipe(
      concatMap(name => getLatestNodeVersion(name)),
      map((npmRegistryPackage: NpmRegistryPackage) => {
        const nodeDependency: NodeDependency = {
          type: NodeDependencyType.Dev,
          name: npmRegistryPackage.name,
          version: npmRegistryPackage.version,
          overwrite: false
        };
        addPackageJsonDependency(tree, nodeDependency);
        _context.logger.info(`✅️ Added ${npmRegistryPackage.name}`);
        return tree;
      })
    );
  };
}

function installDependencies(): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    _context.addTask(new NodePackageInstallTask());
    _context.logger.debug("✅️ Dependencies installed");
    return tree;
  };
}

function updateAngularJsonOptions(options: any) {
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

      serveJson = "@angular-builders/custom-webpack:browser";

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

// const tailwindStyle =

/**
 * Adds custom Tailwind CSS styles to the project style file.
 */
function addTailwindCSSStyles(options: any) {
  return (host: Tree, context: SchematicContext) => {
    const workspace = getWorkspace(host);
    const project = getProjectFromWorkspace(workspace, options.project);
    const styleFilePath = getProjectStyleFile(project);
    const logger = context.logger;

    if (!styleFilePath) {
      logger.error(`Could not find the default style file for this project.`);
      // logger.info(
      //   `Please consider manually setting up the Roboto font in your CSS.`
      // );
      return;
    }

    const buffer = host.read(styleFilePath);

    if (!buffer) {
      logger.error(
        `Could not read the default style file within the project ` +
          `(${styleFilePath})`
      );
      // logger.info(`Please consider manually setting up the Robot font.`);
      return;
    }

    const htmlContent = buffer.toString();
    const insertion =
      "\n" +
      `@import 'tailwindcss/base';\n` +
      `@import 'tailwindcss/components';\n` +
      `@import 'tailwindcss/utilities';\n`;

    if (htmlContent.includes(insertion)) {
      return;
    }

    const recorder = host.beginUpdate(styleFilePath);

    recorder.insertLeft(htmlContent.length, insertion);
    host.commitUpdate(recorder);
  };
}
