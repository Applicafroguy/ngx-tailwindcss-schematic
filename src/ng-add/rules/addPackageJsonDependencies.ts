import {
    SchematicContext,
    Tree,
    Rule} from "@angular-devkit/schematics";
import { defaultDependencies } from '../../app/versions.json';
import { addDependencies } from "../../util/stringifyFormatted";


// Adds Packages
export const addPackageJsonDependencies = () : Rule=> {
    
 return (tree: Tree, context: SchematicContext) => {

    try {
       
    addDependencies(
        tree,
        {...defaultDependencies},
        context
    );
    } catch (error) {
        
    }
   
    return tree;
  };
  
};