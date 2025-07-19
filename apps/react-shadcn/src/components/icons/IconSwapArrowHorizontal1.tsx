// icons/svgs/contrast/arrows-&-chevrons

import type React from "react"
import type { SVGProps } from "react"

export const IconSwapArrowHorizontal1: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
					d="M3.14 15.604A20.2 20.2 0 0 1 6.887 12l-.165 2.223a24 24 0 0 0 0 3.554L6.887 20a20.2 20.2 0 0 1-3.747-3.604.63.63 0 0 1 0-.792Z"
				/>
				<path
					fill="currentColor"
					d="M17.113 4a20.2 20.2 0 0 1 3.747 3.604.63.63 0 0 1 0 .792A20.2 20.2 0 0 1 17.113 12l.165-2.223a24 24 0 0 0 0-3.554z"
				/>
			</g>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M6.656 16H17M6.656 16q0-.89.066-1.777L6.887 12a20.2 20.2 0 0 0-3.747 3.604.63.63 0 0 0 0 .792A20.2 20.2 0 0 0 6.887 20l-.165-2.223A24 24 0 0 1 6.656 16Zm10.688-8H7m10.344 0q0-.89-.066-1.777L17.113 4a20.2 20.2 0 0 1 3.747 3.604.63.63 0 0 1 0 .792A20.2 20.2 0 0 1 17.113 12l.165-2.223q.066-.888.066-1.777Z"
			/>
		</svg>
	)
}

export default IconSwapArrowHorizontal1
