import { SchematicContext, Tree } from "@angular-devkit/schematics";
import { getWorkspace } from "@schematics/angular/utility/config";
import { getProjectStyleFile } from "../../util/style-file";
import { getProjectFromWorkspace } from "@angular/cdk/schematics";
// const tailwindStyle =
/**
 * Adds custom Tailwind CSS styles to the project style file.
 */
export function addTailwindCSSStyles(options: any) {
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
