export function setElementAnchorAndFocus(
	element: HTMLElement,
	{ anchor, focus }: { anchor: number; focus?: number },
) {
	const selection = document.getSelection()!
	const range = document.createRange()

	const resultAnchor = getNodeAndOffsetAtIndex(element, anchor)
	range.setStart(resultAnchor.node, resultAnchor.offset)
	range.setEnd(resultAnchor.node, resultAnchor.offset)

	selection.empty()
	selection.addRange(range)

	if (focus !== undefined) {
		const resultFocus = getNodeAndOffsetAtIndex(element, focus)
		selection.extend(resultFocus.node, resultFocus.offset)
	}
}

function getNodeAndOffsetAtIndex(element: Node, index: number) {
	const nodes = element.childNodes

	let accumulator = 0

	// Determine which node contains the selection-(start|end)
	for (const node of nodes) {
		const contentLength = node.textContent?.length || 0

		accumulator += contentLength

		if (accumulator >= index) {
			const offset = index - (accumulator - contentLength)
			if (node instanceof Text) {
				return {
					node,
					offset,
				}
			}
			return getNodeAndOffsetAtIndex(node, offset)
		}
	}

	throw "Could not find node"
}
