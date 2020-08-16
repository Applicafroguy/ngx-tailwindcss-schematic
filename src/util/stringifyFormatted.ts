import {
    SchematicContext,
    Tree,
    SchematicsException
} from "@angular-devkit/schematics";
import { getLatestNodeVersion } from "./npmjs";
import { of, Observable } from 'rxjs';
import { map, concatMap } from 'rxjs/operators';
import { NpmRegistryPackage } from './npmjs'
import {
    addPackageJsonDependency,
    NodeDependency,
    NodeDependencyType
} from "@schematics/angular/utility/dependencies";
import { getPackageVersionFromPackageJson } from "../ng-add/rules/getPackageVersionFromPackageJson";

const devDependencies = ['', '']

export const stringifyFormatted = (obj: any) => JSON.stringify(obj, null, 2);

export const overwriteIfExists = (
    tree: Tree,
    path: string,
    content: string,
    context: SchematicContext
) => {
    context.logger.info('over')
    if (tree.exists(path)) {
        tree.overwrite(path, content);
        context.logger.info('exist')
        context.logger.info(content)
    }
    else {
        tree.create(path, content);
        context.logger.info('create')
        context.logger.info(content)
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
    context: SchematicContext
): Observable<boolean> => {


    // Gets core version
    const ngCoreVersionTag = getPackageVersionFromPackageJson(
        host,
        "@angular/core"
    );

    return of(...devDependencies).pipe(
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
                type: NodeDependencyType.Default,
                name: npmRegistryPackage.name,
                version: packageVersion,
                overwrite: false
            };
            context.logger.info(`✅️ Added ${npmRegistryPackage.name}@${npmRegistryPackage.version} to your devDependency`);
            addPackageJsonDependency(host, nodeDependency);
            return true;
        })
    );

    // const start = async () => {
    //     await asyncForEach(Object.keys(deps), async (depName: string) => {
    //         const dep = deps[depName];
    //         if (dep.dev) {
    //             const existingVersion = packageJson.devDependencies[depName];
    //             if (existingVersion) {
    //                 if (!semver.intersects(existingVersion, dep.version)) {
    //                     context.logger.warn(`⚠️ The ${depName} devDependency specified in your package.json`);
    //                     // TODO offer to fix
    //                 }
    //             }
    //             else {

    //                     // Get latest version from npm
    //                     const depVersion = await (await getLatestNodeVersion(depName)).version

    //                     // Add Dependency to package.json file
    //                     packageJson.devDependencies[depName] = depVersion;
    //                     // context.logger.info(`${{...packageJson.devDependencies}}`);
    //                     context.logger.info(`✅️ Added ${depName}@${depVersion} to your devDependency`);

    //             }
    //         }
    //     });
    // }

    // // Start
    // start()

    // overwriteIfExists(host, 'package.json', stringifyFormatted(packageJson), context);
};
