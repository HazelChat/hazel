// icons/svgs/stroke/editing

import type React from "react"
import type { SVGProps } from "react"

export const IconEraserLineStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="m14.268 17.292-.907.908c-.302.301-.567.567-.807.8m1.714-1.708 3.932-3.931c1.27-1.27 1.905-1.905 2.143-2.638.21-.644.21-1.338 0-1.982-.238-.733-.873-1.368-2.143-2.638l-.303-.303c-1.27-1.27-1.905-1.905-2.638-2.143a3.2 3.2 0 0 0-1.982 0c-.732.238-1.368.873-2.638 2.143L6.708 9.732m7.56 7.56-7.56-7.56m0 0-.908.907c-1.27 1.27-1.905 1.906-2.143 2.638a3.2 3.2 0 0 0 0 1.982c.238.733.873 1.368 2.143 2.638l.303.303c.301.301.567.567.807.8h5.644m0 0H21"
				fill="none"
			/>
		</svg>
	)
}

export default IconEraserLineStroke
