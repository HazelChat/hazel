// icons/svgs/duo-stroke/arrows-&-chevrons

import type React from "react"
import type { SVGProps } from "react"

export const IconArrowBigDownLeftDuoStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M14.809 19.091a61 61 0 0 1-3.062-2.595l7.017-7.017c.396-.396.594-.594.668-.822a1 1 0 0 0 0-.618c-.074-.228-.272-.426-.668-.822l-1.98-1.98c-.396-.396-.594-.594-.823-.669a1 1 0 0 0-.618 0c-.228.075-.426.273-.822.669l-7.017 7.017A61 61 0 0 1 4.91 9.19"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M14.809 19.09a35.3 35.3 0 0 1-9.096.178 1.11 1.11 0 0 1-.981-.98A35.3 35.3 0 0 1 4.91 9.19"
				fill="none"
			/>
		</svg>
	)
}

export default IconArrowBigDownLeftDuoStroke
