import {createContext} from 'react';
import {IEditorContext, IEditorState} from './types';


export const EditorContext = createContext<IEditorContext>({
    update(newState: IEditorState): void {
    },
    editor: {
        document: {
            cursorPosition: 0,
            value: 'C4',
            path: 'new.sw'
        }
    }
});
