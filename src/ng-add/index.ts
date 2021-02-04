import {
  chain,
  Rule,
  SchematicContext,
  Tree,
  mergeWith,
  url,
  apply,
  SchematicsException
} from "@angular-devkit/schematics";
import { installDependencies } from "./rules/installDependencies";
import { updateAngularJsonOptions } from "./rules/updateAngularJsonOptions";
import { addPackageJsonDependencies } from "./rules/addPackageJsonDependencies";
import { Schema } from "./schema";


export default function (_options: Schema): Rule {
  return (tree: Tree, _context: SchematicContext) => {

    return chain([
      addPackageJsonDependencies(),
      createTailwindCss(_options),
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
function createTailwindCss(_options: Schema): Rule {
  return (tree: Tree) => {

    const angularJSON = tree.read("angular.json")!.toString("utf-8");

    // Check if  is an angular cli workspace
    if (!angularJSON) {
      throw new SchematicsException("Not an Angular CLI workspace");
    }

    // Get angular workspace
    const workspace = JSON.parse(angularJSON);

    // Get Project name
    const projectName = _options.project || workspace.defaultProject;

    // Get project
    const project = workspace.projects[projectName];

    // Get SRC Path
    const srcPath = project['sourceRoot'];

    tree.create(`${srcPath}/tailwind/tailwind.scss`,
      `@import "tailwindcss/base";\n@import "tailwindcss/components";\n@import "tailwindcss/utilities";`);
    return tree;
  };
}