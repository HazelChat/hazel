// icons/svgs/contrast/arrows-&-chevrons

import type React from "react"
import type { SVGProps } from "react"

export const IconSwapArrowVertical1: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
					d="M15.604 20.86A20.2 20.2 0 0 1 12 17.113l2.223.165a24 24 0 0 0 3.554 0L20 17.113a20.2 20.2 0 0 1-3.604 3.747.63.63 0 0 1-.792 0Z"
				/>
				<path
					fill="currentColor"
					d="M4 6.887A20.2 20.2 0 0 1 7.604 3.14a.63.63 0 0 1 .792 0A20.2 20.2 0 0 1 12 6.887l-2.223-.165a24 24 0 0 0-3.554 0z"
				/>
			</g>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M16 17.344V7m0 10.344q-.89 0-1.777-.066L12 17.113a20.2 20.2 0 0 0 3.604 3.747.63.63 0 0 0 .792 0A20.2 20.2 0 0 0 20 17.113l-2.223.165q-.888.066-1.777.066ZM8 6.656V17M8 6.656q-.89 0-1.777.066L4 6.887A20.2 20.2 0 0 1 7.604 3.14a.63.63 0 0 1 .792 0A20.2 20.2 0 0 1 12 6.887l-2.223-.165A24 24 0 0 0 8 6.656Z"
			/>
		</svg>
	)
}

export default IconSwapArrowVertical1
