import {
  SchematicContext,
  Tree,
  Rule
} from "@angular-devkit/schematics";
import { addDependencies } from "../../util/stringifyFormatted";
import { defaultDependencies } from '../../app/versions.json'

// Adds Packages
export const addPackageJsonDependencies = (): Rule => {

  return (tree: Tree, context: SchematicContext) => {

    addDependencies(
      tree,
      defaultDependencies,
      context
    );

  };

};