// icons/svgs/contrast/users

import type React from "react"
import type { SVGProps } from "react"

export const IconUserCheck1: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				<path fill="currentColor" d="M11 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
				<path
					fill="currentColor"
					d="M7 14h1.659l2.382 1.172a3 3 0 0 0 .839 2.617l2.341 2.338q.057.057.116.11L13.469 22H5a3 3 0 0 1-3-3 5 5 0 0 1 5-5Z"
				/>
			</g>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M10.051 15H7a4 4 0 0 0-4 4 2 2 0 0 0 2 2h8.684M14 15.666l2.341 2.339C17.49 15.997 19.093 14.303 21 13m-6-6a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"
			/>
		</svg>
	)
}

export default IconUserCheck1
