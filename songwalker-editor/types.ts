export interface IAppContext {
    appState: IAppState,

    updateAppState(newState: IAppState | ((oldState: IAppState) => IAppState)): void
}

export interface IAppState {
    // menu: MenuState,
    activeEditor: ISourceEditorState,
}


export interface ISourceEditorState {
    path: string,
    value: string,
    cursorPosition: number,
    // isPlaying: boolean,
    // errors: Array<string>,
}
