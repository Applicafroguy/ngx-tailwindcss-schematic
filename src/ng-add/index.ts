import {
  chain,
  Rule,
  SchematicContext,
  Tree,
  mergeWith,
  template,
  url,
  apply,
  forEach,
  FileEntry
} from "@angular-devkit/schematics";
import { installDependencies } from "./rules/installDependencies";
import { updateAngularJsonOptions } from "./rules/updateAngularJsonOptions";
import { addTailwindCSSStyles } from "./rules/addTailwindCSSStyles";
import { addPackageJsonDependencies } from "./rules/addPackageJsonDependencies";

export default function (_options: any): Rule {
  return (tree: Tree, _context: SchematicContext) => {

    return chain([
      addPackageJsonDependencies(),
      installDependencies(),
      addTailwindCSSStyles(_options),
      mergeWith(
        apply(url("./files"), [
          template({
            INDEX: _options.index,
            name: _options.name
          }),

          forEach((fileEntry: FileEntry) => {
            if (tree.exists(fileEntry.path)) {
              return null;
            }
            return fileEntry;
          })
        ])
      ),
      updateAngularJsonOptions(_options)
    ])(tree, _context);
  };
}


