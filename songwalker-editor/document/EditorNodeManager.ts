import React, {RefObject} from "react";
import Undo from "undoh";
import {ConfigObject} from "../config/configActions";
import {sourceToTokens} from "@songwalker/tokens";
import {insertIntoSelection, mapTokensToDOM, walkDOM} from "@songwalker-editor/domUtils";
import {EditorState} from "./SourceEditor";

export class EditorNodeManager {
    private readonly ref: RefObject<HTMLElement>;
    private readonly undoBuffer: Undo<EditorState>;
    private saveTimeout: NodeJS.Timeout | undefined;
    private undoTimeout: NodeJS.Timeout | undefined;
    private lastCursorPosition: number;

    constructor(editorRef: RefObject<HTMLElement>, initialValue: EditorState) {
        this.ref = editorRef;
        this.undoBuffer = new Undo<EditorState>(initialValue);
        this.lastCursorPosition = 0;
    }

    getLastCursorPosition() {
        return this.lastCursorPosition
    }

    unload() {
        clearTimeout(this.saveTimeout);
        clearTimeout(this.undoTimeout);
    }

    retainEditorState(
        cursorPosition = this.lastCursorPosition,
        value = this.getValue()
    ) {
        this.undoBuffer.retain({value, cursorPosition})
        // console.log('this.undoBuffer', this.undoBuffer)
    }

    startRetainTimeout(editorRetainTimeout: number) {
        clearTimeout(this.saveTimeout)
        this.saveTimeout = setTimeout(() => this.retainEditorState(), editorRetainTimeout)
    }

    getNode() {
        if (!this.ref || !this.ref.current)
            throw new Error("Ref is not available yet");
        return this.ref.current;
    }

    getValue() {
        return this.getNode().innerText;
    }

    render(trackValueString: string) {
        const tokenList = sourceToTokens(trackValueString);
        // console.log('render', trackValueString, tokenList)
        mapTokensToDOM(tokenList, this.getNode())
        if (this.getValue() !== trackValueString)
            throw new Error("Rendering value mismatch");
    }


    refreshNode() {
        const editorValue = this.getValue();
        const cursorPosition = this.getCursorPosition();
        this.render(editorValue);
        this.setCursorPosition(cursorPosition);
        // clearTimeout(saveTimeout)
        // saveTimeout = setTimeout(updateEditorState, config.editorUpdateTimeout)
    }

    getCursorPosition(): number {
        const selection: Selection | null = window.getSelection();
        if (!selection)
            throw new Error("Invalid selection")
        const {focusNode, focusOffset} = selection;
        let editorPosition = -1;
        const editorNode = this.getNode()
        if (!editorNode.contains(focusNode))
            throw new Error("Focus node not in editor")

        const result = walkDOM(editorNode, (childNode, offset) => {
            if (childNode === focusNode) {
                editorPosition = offset + focusOffset
                return true;
            }
        })
        if (!result)
            throw new Error("focusNode not found in editor");
        // console.log('getEditorPosition', editorPosition);
        this.lastCursorPosition = editorPosition;
        return editorPosition;
    }


    setCursorPosition(cursorPosition: number) {
        if (cursorPosition < 0 || isNaN(cursorPosition))
            throw new Error("Invalid editor position: " + cursorPosition)


        const result = walkDOM(this.getNode(), (childNode, offset) => {
            if (childNode.nodeType !== Node.TEXT_NODE)
                return false;
            if (childNode.nodeValue === null)
                throw new Error('childNode.nodeValue === null')
            const newOffset = offset + childNode.nodeValue.length;
            if (newOffset >= cursorPosition) {
                const focusOffset = cursorPosition - offset;
                const range = document.createRange()

                range.setStart(childNode, focusOffset)
                // range.collapse(true)

                const sel = window.getSelection()
                if (!sel)
                    throw new Error("Invalid window.getSelection()");
                sel.removeAllRanges()
                sel.addRange(range)
                // console.log('setEditorPosition', cursorPosition, focusOffset, childNode, sel, range);
                // console.log('setEditorPosition', offset, editorPosition, childNode, focusOffset);
                return true;
            }
        })
        if (!result)
            console.error("Reached end of editor. Position not found: " + cursorPosition)

    }


    handleEvent(e: React.SyntheticEvent<HTMLDivElement>, config: ConfigObject) {
        switch (e.type) {
            default:
                console.log(e.type, e);
                break;
            case 'focus':
                this.setCursorPosition(this.lastCursorPosition)
                break;
            case 'input':
                this.refreshNode()
                break;
            case 'keyup':
                this.getCursorPosition()
                this.startRetainTimeout(config.editorRetainTimeout);
                break;
            case 'keydown':
                let ke = e as React.KeyboardEvent<HTMLDivElement>
                switch (ke.code) {
                    case 'Enter':
                        ke.preventDefault();
                        insertIntoSelection("\n")
                        return;
                    // case 'Tab': // TODO group shift?
                    //     e.preventDefault();
                    //     insertIntoOffset("\t")
                    //     return;
                    case 'KeyZ':
                        if (ke.ctrlKey) {
                            ke.preventDefault();
                            if (ke.shiftKey) {
                                const redoValue = this.undoBuffer.redo();
                                console.log('redoValue', redoValue)
                                this.render(redoValue.value);
                                this.setCursorPosition(redoValue.cursorPosition)
                            } else {
                                const undoValue = this.undoBuffer.undo();
                                console.log('undoValue', undoValue)
                                this.render(undoValue.value);
                                this.setCursorPosition(undoValue.cursorPosition)
                            }
                        }
                        return;
                    // case 'ControlLeft':
                    //     e.preventDefault();
                    //     setEditorPosition(getEditorPosition() - 1);
                    //     console.log(e.code)
                    //     break;
                    default:
                        // console.log(e.key)
                        break;
                }
                break;
        }
    }
}