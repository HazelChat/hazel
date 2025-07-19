// icons/svgs/contrast/general

import type React from "react"
import type { SVGProps } from "react"

export const IconDownloadDown1: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				fill="currentColor"
				d="M11.556 14.843A15 15 0 0 1 9 12.188a30 30 0 0 0 6 0 15 15 0 0 1-2.556 2.655.704.704 0 0 1-.888 0Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M3 15a5 5 0 0 0 5 5h8a5 5 0 0 0 5-5m-9-2.661V4m0 8.339q-1.503 0-3-.15a15 15 0 0 0 2.556 2.654.704.704 0 0 0 .888 0A15 15 0 0 0 15 12.188q-1.498.15-3 .15Z"
			/>
		</svg>
	)
}

export default IconDownloadDown1
