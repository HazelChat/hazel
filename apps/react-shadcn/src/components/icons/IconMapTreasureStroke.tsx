// icons/svgs/stroke/navigation

import type React from "react"
import type { SVGProps } from "react"

export const IconMapTreasureStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M7.01 12H7m4.02 0h-.01m3.49-1.5L16 12m0 0 1.5 1.5M16 12l1.5-1.5M16 12l-1.5 1.5m-4.069-8.784 3.153 1.576c.51.255.765.383 1.032.435a2 2 0 0 0 .768 0c.267-.052.522-.18 1.032-.435 1.491-.746 2.237-1.118 2.843-1.039a2 2 0 0 1 1.399.864C21 6.624 21 7.457 21 9.125v5.897c0 .718 0 1.077-.11 1.394a2 2 0 0 1-.461.747c-.235.24-.556.4-1.198.721l-2.8 1.4c-.525.263-.787.394-1.062.446a2 2 0 0 1-.738 0c-.275-.052-.537-.183-1.062-.445l-3.153-1.577c-.51-.255-.765-.382-1.032-.435a2 2 0 0 0-.768 0c-.267.053-.522.18-1.032.435-1.491.746-2.237 1.118-2.843 1.04a2 2 0 0 1-1.399-.865C3 17.376 3 16.543 3 14.875V8.978c0-.718 0-1.077.11-1.394a2 2 0 0 1 .461-.747c.235-.24.556-.4 1.198-.721l2.8-1.4c.525-.263.787-.394 1.062-.446a2 2 0 0 1 .738 0c.275.052.537.183 1.062.446Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconMapTreasureStroke
