// icons/svgs/contrast/arrows-&-chevrons

import type React from "react"
import type { SVGProps } from "react"

export const IconMinimizeTwoArrow1: React.FC<SVGProps<SVGSVGElement>> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<g fill="currentColor" opacity=".28">
				<path
					fill="currentColor"
					d="M10.347 13.087A20.8 20.8 0 0 0 5 13.29l1.73 1.493a24 24 0 0 1 2.488 2.487L10.71 19c.298-1.779.366-3.576.202-5.347a.625.625 0 0 0-.566-.566Z"
				/>
				<path
					fill="currentColor"
					d="M13.653 10.913c1.771.164 3.568.096 5.347-.202l-1.73-1.493a24 24 0 0 1-2.488-2.487L13.29 5a20.8 20.8 0 0 0-.202 5.347.625.625 0 0 0 .566.566Z"
				/>
			</g>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M10.347 13.087A20.8 20.8 0 0 0 5 13.29l1.73 1.493a24 24 0 0 1 2.488 2.487L10.71 19c.298-1.779.366-3.576.202-5.347a.625.625 0 0 0-.566-.566Z"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M13.653 10.913c1.771.164 3.568.096 5.347-.202l-1.73-1.493a24 24 0 0 1-2.488-2.487L13.29 5a20.8 20.8 0 0 0-.202 5.347.625.625 0 0 0 .566.566Z"
			/>
		</svg>
	)
}

export default IconMinimizeTwoArrow1
