export function createRemoteCursorWidget(
    monaco,
    socketId,
    username,
    color,
    position
) {
    const domNode = document.createElement("div");
    domNode.style.position = "absolute"
    domNode.style.pointerEvents = "none";

    const label = document.createElement("div");
    label.textContent = username;
    label.style.whiteSpace = "nowrap";
    label.style.background = color;
    label.style.color = "white";
    label.style.fontSize = "11px";
    label.style.padding = "2px 6px";
    label.style.borderRadius = "4px";
    label.style.marginBottom = "2px";


    const cursor = document.createElement("div");
    cursor.style.width = "2px";
    cursor.style.height = "18px";
    cursor.style.background = color;
    cursor.style.marginLeft = "2px";
    domNode.appendChild(cursor);
    domNode.appendChild(label);


    return {
        id: `cursor-${socketId}`,
        position,

        getId() {
            return this.id;
        },

        getDomNode() {
            return domNode;
        },

        getPosition() {
            return {
                position: this.position,
                preference: [
                    monaco.editor.ContentWidgetPositionPreference.EXACT
                ]
            };
        }
    };
}