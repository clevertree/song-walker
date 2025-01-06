import {createContext} from 'react';
import {IEditorContext, IEditorState} from './types';

export const initialEditorState: IEditorState = {
    document: {
        cursorPosition: 0,
        value: 'C4',
        path: 'new.sw'
    }
};

export const EditorContext = createContext<IEditorContext>(null as unknown as IEditorContext);
