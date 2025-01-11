import {mapTokensToDOM} from "@songwalker-editor/helper/domHelper";
import {sourceToTokens} from "@songwalker";
import {ISourceEditorCursorRange} from "@songwalker-editor/types";

export function renderSourceEditor(editor: HTMLElement, sourceValue: string, cursorPosition: number) {
    const tokenList = sourceToTokens(sourceValue);
    // const caretOffset = getCaretOffset(editor);
    // console.log('render', tokenList, cursorPosition)

    mapTokensToDOM(tokenList, editor, (newNode, charOffset, length) => {
        // if (!cursorNode && (charOffset - length <= cursorPosition) && (charOffset > cursorPosition)) {
        //     cursorNode = newNode;
        //     cursorNodeOffset = charOffset - length;
        //     if ((cursorPosition - cursorNodeOffset) > (<HTMLElement>cursorNode).innerHTML.length) {
        //         debugger;
        //     }
        // }
    });

    // TODO move set cursor logic here < ^ v
    setCursorPosition(editor, cursorPosition);

    const renderedValue = renderValue(editor);
    if (renderedValue !== sourceValue)
        console.error(`Rendering value mismatch: \n`, renderedValue, ` !== \n`, sourceValue);
}

export function renderValue(editor: HTMLElement) {
    return editor.innerText;
    // return Array.prototype.map.call(editor.childNodes,
    //     child => child.innerText || child.textContent).join('');
}

export function getSelectionRange(editor: HTMLElement): ISourceEditorCursorRange {
    let sel = window.getSelection();
    if (!sel || sel.rangeCount === 0)
        throw new Error("Invalid window.getSelection()")
    const range = sel.getRangeAt(0);
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(editor);
    preCaretRange.setEnd(range.startContainer, range.startOffset);
    const start = preCaretRange.toString().length;
    // preCaretRange.selectNodeContents(editor);
    preCaretRange.setEnd(range.endContainer, range.endOffset);
    const end = preCaretRange.toString().length;
    return {
        start,
        end,
        collapsed: range.collapsed
    };
}

function setCursorPosition(contentEditable: HTMLElement, cursorPosition: number) {
    const range = createRange();
    const selection = window.getSelection();
    if (!selection)
        throw 'window.getSelection() is null. Iframe?';
    selection.removeAllRanges();
    selection.addRange(range);

    range.collapse(false);


    function createRange() {
        let range = document.createRange();
        range.selectNode(contentEditable);
        range.setStart(contentEditable, 0);

        let pos = 0;
        const stack = [contentEditable];
        let current;
        while (current = stack.pop()) {
            if (current.nodeType === Node.TEXT_NODE) {
                if (!current.textContent)
                    throw 'text node has no textContent';
                const len = current.textContent.length;
                if (pos + len >= cursorPosition) {
                    range.setEnd(current, cursorPosition - pos);
                    return range;
                }
                pos += len;
            } else if (current.childNodes && current.childNodes.length > 0) {
                for (let i = current.childNodes.length - 1; i >= 0; i--) {
                    stack.push(<HTMLElement>current.childNodes[i]);
                }
            }
        }

        // The target position is greater than the
        // length of the contenteditable element.
        range.setEnd(contentEditable, contentEditable.childNodes.length);
        return range;
    }

}
