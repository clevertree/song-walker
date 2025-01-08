import React, {useContext} from "react";
import {IEditorContext} from "@songwalker-editor/types";
import DocumentEditor from "@songwalker-editor/document/DocumentEditor";
import {EditorContext} from "@songwalker-editor/context";

export function ActiveEditors() {
    const {editor} = useContext<IEditorContext>(EditorContext)

    return <DocumentEditor state={editor.document}/>
}
