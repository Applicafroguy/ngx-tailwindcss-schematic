import {
  chain,
  Rule,
  SchematicContext,
  Tree,
  mergeWith,
  url,
  apply
} from "@angular-devkit/schematics";
import { installDependencies } from "./rules/installDependencies";
import { updateAngularJsonOptions } from "./rules/updateAngularJsonOptions";
import { addPackageJsonDependencies } from "./rules/addPackageJsonDependencies";
import { Schema } from "./schema";


export default function (_options: Schema): Rule {
  return (tree: Tree, _context: SchematicContext) => {

    return chain([
      addPackageJsonDependencies(),
      createTailwindCss(),
      addConfig(`./files/tailwind-config/${_options.workspace}`, _context),
      addConfig('./files/webpack', _context),
      updateAngularJsonOptions(_options),
      installDependencies()
    ])(tree, _context);
  };
}

function addConfig(path: string, _context: SchematicContext): Rule {
  return async (_host: Tree) => {
    _context.logger.debug(`Src Path ${path}`);
    const sourceTemplates = url(path);
    const applyTemplate = apply(sourceTemplates, []);
    return mergeWith(applyTemplate);
  };
}

/**
 * Create tailwind.css in source root project
 * adds tailwindcss imports
 */
function createTailwindCss(): Rule {
  return (tree: Tree) => {
    tree.create('src/tailwind/tailwind.css',
      `@import "tailwindcss/base";\n@import "tailwindcss/components";\n@import "tailwindcss/utilities";`);
    return tree;
  };
}