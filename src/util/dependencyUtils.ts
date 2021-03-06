import {
    SchematicContext,
    Tree,
    SchematicsException
} from "@angular-devkit/schematics";
import * as semver from 'semver';


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

export const addDependencies = async (
    host: Tree,
    deps: { [name: string]: { dev: boolean, version: string } },
    context: SchematicContext
) => {


    const packageJson = host.exists('package.json') && safeReadJSON('package.json', host);

    if (packageJson === undefined) {
        throw new SchematicsException('Could not locate package.json');
    }

    context.logger.info(`Getting Dependencies`);

    Object.keys(deps).forEach(depName => {
        const dep = deps[depName];
        if (dep.dev) {
            const existingVersion = packageJson.devDependencies[depName];

            if (existingVersion) {
                if (!semver.intersects(existingVersion, dep.version)) {
                    context.logger.warn(`⚠️ The ${depName} devDependency specified in your package.json`);
                    // TODO offer to fix
                }
                context.logger.info(`✅️ ${depName}:${dep.version} is already added`);
            }
            else {

                // Add Dependency to package.json file
                packageJson.devDependencies[depName] = dep.version;
                context.logger.info(`✅️ Added ${depName}@${dep.version} to your devDependency`);

            }
        }
    });

    overwriteIfExists(host, 'package.json', stringifyFormatted(packageJson));
};

