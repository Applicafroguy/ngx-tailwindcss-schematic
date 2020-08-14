import {
    SchematicContext,
    Tree,
    SchematicsException
} from "@angular-devkit/schematics";
import * as semver from 'semver';
import { getLatestNodeVersion } from "./npmjs";


export const stringifyFormatted = (obj: any) => JSON.stringify(obj, null, 2);

export const overwriteIfExists = (
    tree: Tree,
    path: string,
    content: string
) => {
    if (tree.exists(path)) {
        tree.overwrite(path, content);
    }
    else {
        tree.create(path, content);
    }
};

export function safeReadJSON(path: string, tree: Tree) {
    try {
        // tslint:disable-next-line:no-non-null-assertion
        return JSON.parse(tree.read(path)!.toString());
    }
    catch (e) {
        throw new SchematicsException(`Error when parsing ${path}: ${e.message}`);
    }
}

export const addDependencies = (
    host: Tree,
    deps: { [name: string]: { dev?: boolean; version: string } },
    context: SchematicContext
) => {

    const packageJson = host.exists('package.json') && safeReadJSON('package.json', host);

    if (packageJson === undefined) {
        throw new SchematicsException('Could not locate package.json');
    }

    Object.keys(deps).forEach(async depName => {
        const dep = deps[depName];
        if (dep.dev) {
            const existingVersion = packageJson.devDependencies[depName];
            if (existingVersion) {
                if (!semver.intersects(existingVersion, dep.version)) {
                    context.logger.warn(`⚠️ The ${depName} devDependency specified in your package.json`);
                    // TODO offer to fix
                }
            }
            else {

                try {

                    // Get latest version from npm
                    const depVersion = await (await getLatestNodeVersion(depName)).version

                    // Add Dependency to package.json file
                    packageJson.devDependencies[depName] = depVersion;
                    context.logger.info(`✅️ Added ${depName}@${depVersion} to your devDependency`);
                } catch (err) {

                }
            }
        }
    });

    overwriteIfExists(host, 'package.json', stringifyFormatted(packageJson));
};
