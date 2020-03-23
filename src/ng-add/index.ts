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
import {
  addPackageJsonDependency,
  NodeDependency,
  NodeDependencyType
} from "@schematics/angular/utility/dependencies";
import { Observable, of } from "rxjs";
import { concatMap, map } from "rxjs/operators";
import { getLatestNodeVersion, NpmRegistryPackage } from "../util/npmjs";
import { installDependencies } from "./rules/installDependencies";
import { updateAngularJsonOptions } from "./rules/updateAngularJsonOptions";
import { addTailwindCSSStyles } from "./rules/addTailwindCSSStyles";
import { getPackageVersionFromPackageJson } from "./rules/getPackageVersionFromPackageJson";

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
    // Gets core version
    const ngCoreVersionTag = getPackageVersionFromPackageJson(
      tree,
      "@angular/core"
    );

    return of(
      "tailwindcss",
      "postcss-scss",
      "postcss-import",
      "postcss-loader",
      "@angular-builders/custom-webpack"
    ).pipe(
      concatMap(name => getLatestNodeVersion(name)),
      map((npmRegistryPackage: NpmRegistryPackage) => {
        // Checks Angular Core version
        const packageVersion =
          npmRegistryPackage.name === "@angular-builders/custom-webpack"
            ? ngCoreVersionTag?.startsWith("8", 1)
              ? "8.4.1"
              : npmRegistryPackage.version
            : npmRegistryPackage.version;

        const nodeDependency: NodeDependency = {
          type: NodeDependencyType.Dev,
          name: npmRegistryPackage.name,
          version: packageVersion,
          overwrite: false
        };
        addPackageJsonDependency(tree, nodeDependency);
        _context.logger.info(`✅️ Added ${npmRegistryPackage.name}`);
        return tree;
      })
    );
  };
}
