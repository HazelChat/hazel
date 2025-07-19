// icons/svgs/stroke/media

import type React from "react"
import type { SVGProps } from "react"

export const IconIncognitoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M10 17h4m-4 0a4 4 0 1 1-8 0 4 4 0 0 1 8 0Zm4 0a4 4 0 1 0 8 0 4 4 0 0 0-8 0Zm5.583-7.282L16.97 4.82a3 3 0 0 0-3.019-1.565 14.6 14.6 0 0 1-3.904 0 3 3 0 0 0-3.02 1.565l-2.61 4.897m15.165 0A40 40 0 0 1 22 10.26m-2.417-.542a40.4 40.4 0 0 0-15.166 0m0 0Q3.195 9.952 2 10.26"
				fill="none"
			/>
		</svg>
	)
}

export default IconIncognitoStroke
