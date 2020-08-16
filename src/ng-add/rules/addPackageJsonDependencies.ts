import {
  SchematicContext,
  Tree,
  Rule
} from "@angular-devkit/schematics";
import { addDependencies } from "../../util/stringifyFormatted";
import { first } from 'rxjs/operators'
import { NodePackageInstallTask } from "@angular-devkit/schematics/tasks";

// Adds Packages
export const addPackageJsonDependencies = (): Rule => {

  return (tree: Tree, context: SchematicContext) => {

    addDependencies(
      tree,
      context
    ).pipe(first()).toPromise().then(done => {
      if (done) {
        context.addTask(new NodePackageInstallTask());
      }
      else {
        context.logger.info('Done:' + done)
      }

    });



  };

};