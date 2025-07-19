// icons/svgs/contrast/ar-&-vr

import type React from "react"
import type { SVGProps } from "react"

export const IconSpatialEnvironment1: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M5 17.134a29 29 0 0 0-1.662.465l-.086.025a1 1 0 0 1-1.251-.931L2 16.603V4.307a1 1 0 0 1 1.252-.93c.018.004.04.01.086.024a29 29 0 0 0 16.675.193c.16-.046.323-.095.649-.193l.086-.025a1 1 0 0 1 1.251.931l.001.09v12.296a1 1 0 0 1-1.338.906A29 29 0 0 0 19 17.135M17 21a3 3 0 0 0-3-3h-4a3 3 0 0 0-3 3m7.5-8.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z"
			/>
			<path
				fill="currentColor"
				d="M2 4.393v-.09a1 1 0 0 1 1.338-.905c.326.098.489.146.649.192a29 29 0 0 0 16.026 0c.16-.046.323-.094.649-.192l.086-.025a1 1 0 0 1 1.251.93l.001.09V16.69a1 1 0 0 1-1.252.931l-.086-.025a29 29 0 0 0-16.675-.193c-.16.046-.323.095-.649.193l-.086.025a1 1 0 0 1-1.251-.93L2 16.6z"
				opacity=".35"
			/>
		</svg>
	)
}

export default IconSpatialEnvironment1
