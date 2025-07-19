// icons/svgs/solid/editing

import type React from "react"
import type { SVGProps } from "react"

export const IconDrawHighlighterAngle: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				fillRule="evenodd"
				d="M13.593 3.922a1 1 0 0 0-1.414-1.414L9.704 4.983a3.5 3.5 0 0 0-.822 3.65l-.946.946a1.99 1.99 0 0 0-.572 1.643l-4.485 4.485A3 3 0 0 0 2 17.83V19a2 2 0 0 0 2 2h7.586A2 2 0 0 0 13 20.415l1.778-1.778a2 2 0 0 0 1.644-.573l.945-.945a3.5 3.5 0 0 0 3.65-.823l2.476-2.475a1.001 1.001 0 0 0-1.415-1.414l-2.474 2.475a1.5 1.5 0 0 1-2.122 0l-6.364-6.364a1.5 1.5 0 0 1 0-2.12zM9.35 10.993l.708-.707 5.656 5.657-.707.707z"
				clipRule="evenodd"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconDrawHighlighterAngle
