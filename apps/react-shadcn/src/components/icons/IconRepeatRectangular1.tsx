// icons/svgs/contrast/arrows-&-chevrons

import type React from "react"
import type { SVGProps } from "react"

export const IconRepeatRectangular1: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
					d="M18 2a15.3 15.3 0 0 1 2.92 2.777.354.354 0 0 1 0 .446A15.3 15.3 0 0 1 18 8l.061-.612a24 24 0 0 0 0-4.776z"
				/>
				<path
					fill="currentColor"
					d="M6 16a15.3 15.3 0 0 0-2.92 2.777.354.354 0 0 0 0 .446A15.3 15.3 0 0 0 6 22l-.061-.612a24 24 0 0 1 0-4.776z"
				/>
			</g>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M18.18 5H11c-2.8 0-4.2 0-5.27.545A5 5 0 0 0 3.545 7.73c-.476.934-.536 2.12-.544 4.27m15.18-7q0-1.196-.12-2.388L18 2a15.3 15.3 0 0 1 2.92 2.777.355.355 0 0 1 0 .446A15.3 15.3 0 0 1 18 8l.061-.612q.12-1.192.12-2.388ZM5.82 19H13c2.8 0 4.2 0 5.27-.545a5 5 0 0 0 2.185-2.185c.476-.934.536-2.12.544-4.27m-15.18 7a24 24 0 0 1 .12-2.388L6 16a15.3 15.3 0 0 0-2.92 2.777.356.356 0 0 0 0 .446A15.3 15.3 0 0 0 6 22l-.061-.612A24 24 0 0 1 5.819 19Z"
			/>
		</svg>
	)
}

export default IconRepeatRectangular1
