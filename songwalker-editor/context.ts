import {createContext} from 'react';
import {IAppContext, IAppState} from './types';


export const EditorContext = createContext<IAppContext>({
    updateAppState(newState: IAppState): void {
    },
    appState: {
        activeEditor: {
            cursorRange: 0,
            value: 'C4',
            path: 'new.sw'
        }
    }
});
