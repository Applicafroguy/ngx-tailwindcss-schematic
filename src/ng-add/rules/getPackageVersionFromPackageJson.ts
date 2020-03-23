import { Tree } from "@angular-devkit/schematics";
/** Gets the version of the specified package by looking at the package.json in the given tree. */
export function getPackageVersionFromPackageJson(
  tree: Tree,
  name: string
): string | null {
  if (!tree.exists("package.json")) {
    return null;
  }
  const packageJson = JSON.parse(tree.read("package.json")!.toString("utf8"));
  if (packageJson.dependencies && packageJson.dependencies[name]) {
    return packageJson.dependencies[name];
  }
  return null;
}
