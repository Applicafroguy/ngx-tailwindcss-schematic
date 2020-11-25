export interface Schema {
    /** Name of the project to target. */
    project: string;
    workspace: WorkspaceType;
}

export type WorkspaceType = 'ng' | 'nx';