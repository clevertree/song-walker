export function insertIntoSelection(insertString: string) {
    const selection: Selection | null = window.getSelection();
    if (!selection)
        throw new Error("Invalid window.getSelection()")
    const {focusNode, focusOffset} = selection;
    if (!focusNode)
        throw new Error("Invalid focusNode")

    const source = focusNode.nodeValue;
    if (source === null)
        throw new Error("focusNode.nodeValue === null")
    focusNode.nodeValue = source.substring(0, focusOffset) + insertString + source.substring(focusOffset);
    const range = document.createRange()

    range.setStart(focusNode, focusOffset + 1)
    range.collapse(true)

    const sel = window.getSelection()
    if (!sel)
        throw new Error("Invalid window.getSelection()")
    sel.removeAllRanges()
    sel.addRange(range)
}

export function walkDOM(node: Node, callback: (childNode: Node, offset: number) => boolean | undefined) {
    let offset = 0;
    return walk(node)

    function walk(node: Node) {
        const {childNodes} = node;
        if (childNodes.length) {
            for (let i = 0; i < childNodes.length; i++) {
                const childNode = childNodes[i];
                if (callback(childNode, offset))
                    return true;

                if (childNode.nodeType === Node.TEXT_NODE) {
                    offset += (childNode.nodeValue + '').length;
                } else if (childNode.nodeName === "BR") {
                    offset += 1;
                }
                if (childNode.nodeType === Node.ELEMENT_NODE)
                    if (walk(childNode))
                        return true;
            }
        }
        return false; // callback never returned true
    }
}