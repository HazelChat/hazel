// icons/svgs/duo-solid/editing

import type React from "react"
import type { SVGProps } from "react"

export const IconDeleteBackwardLeftDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M7.892 4.093C8.289 3.999 8.678 4 9.157 4h7.883c.666 0 1.226 0 1.683.037.48.04.934.125 1.366.345a3.5 3.5 0 0 1 1.53 1.53c.22.431.305.886.344 1.365C22 7.735 22 8.294 22 8.96v6.08c0 .666 0 1.226-.037 1.684-.04.478-.124.933-.344 1.365a3.5 3.5 0 0 1-1.53 1.53c-.432.22-.887.305-1.366.344-.457.037-1.017.037-1.683.037H9.157c-.48 0-.868 0-1.265-.093a3.7 3.7 0 0 1-.994-.401c-.35-.21-.607-.458-.92-.76l-.048-.047a34 34 0 0 1-4.553-5.446A2.24 2.24 0 0 1 1 12c0-.427.119-.87.377-1.253A34 34 0 0 1 5.93 5.302l.049-.047c.312-.303.57-.552.919-.76.295-.176.66-.324.994-.402Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="m16 15-3-3m0 0-3-3m3 3 3-3m-3 3-3 3"
			/>
		</svg>
	)
}

export default IconDeleteBackwardLeftDuoSolid
