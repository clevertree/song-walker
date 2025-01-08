export interface IEditorContext {
    editor: IEditorState,

    update(newState: IEditorState): void
}

export interface IEditorState {
    // menu: MenuState,
    document: IDocumentState,
}


export interface IDocumentState {
    path: string,
    value: string,
    cursorPosition: number,
    // isPlaying: boolean,
    // errors: Array<string>,
}
