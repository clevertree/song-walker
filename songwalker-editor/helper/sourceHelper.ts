import {mapTokensToDOM} from "@songwalker-editor/helper/domHelper";
import {registerPresetBank, sourceToTokens} from "@songwalker";

console.log('registerPresetBank', registerPresetBank)

export function renderSourceEditor(editor: HTMLElement, sourceValue: string, cursorPosition: number) {
    const tokenList = sourceToTokens(sourceValue);
    // const caretOffset = getCaretOffset(editor);
    console.log('render', tokenList, cursorPosition)

    let cursorNode: ChildNode | null = null, cursorNodeOffset: number = 0;
    mapTokensToDOM(tokenList, editor, (newNode, charOffset, length) => {
        if (!cursorNode && (charOffset - length <= cursorPosition) && (charOffset > cursorPosition)) {
            cursorNode = newNode;
            cursorNodeOffset = charOffset - length;
        }
    });
    if (!cursorNode) {
        debugger;
        throw new Error("Cursor offset not found");
    }
    let sel = window.getSelection();
    if (sel) {
        let range = document.createRange();
        range.selectNode(cursorNode);
        try {
            range.setStart(cursorNode, cursorPosition - cursorNodeOffset);
        } catch (e) {
            debugger;
        }
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
    }


    const renderedValue = renderValue(editor);
    if (renderedValue !== sourceValue)
        console.error(`Rendering value mismatch: \n`, renderedValue, ` !== \n`, sourceValue);
}

export function renderValue(editor: HTMLElement) {
    return Array.prototype.map.call(editor.childNodes,
        child => child.innerText || child.textContent).join('');
}

export function getCaretOffset(editor: HTMLElement) {
    let caretOffset = null;
    let sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        const preCaretRange = range.cloneRange();
        preCaretRange.selectNodeContents(editor);
        preCaretRange.setEnd(range.endContainer, range.endOffset);
        caretOffset = preCaretRange.toString().length;
    }
    return caretOffset;
}
