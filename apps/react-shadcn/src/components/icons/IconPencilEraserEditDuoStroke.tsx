// icons/svgs/duo-stroke/general

import type React from "react"
import type { SVGProps } from "react"

export const IconPencilEraserEditDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M18.616 9.117 7.528 20.253c-.275.276-.413.415-.574.514a1.6 1.6 0 0 1-.46.19c-.183.045-.378.044-.767.044L3 20.996l.066-2.68c.01-.377.014-.566.06-.742q.06-.237.19-.445c.096-.155.228-.289.494-.555L14.917 5.418"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M5.727 21 3 20.996l.066-2.68M16.863 3.462a1.57 1.57 0 0 1 1.964-.212 6.3 6.3 0 0 1 1.932 1.965c.404.65.273 1.473-.258 2.006l-1.885 1.894-3.699-3.699z"
				fill="none"
			/>
		</svg>
	)
}

export default IconPencilEraserEditDuoStroke
