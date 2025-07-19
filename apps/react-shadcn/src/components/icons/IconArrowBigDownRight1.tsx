// icons/svgs/contrast/arrows-&-chevrons

import type React from "react"
import type { SVGProps } from "react"

export const IconArrowBigDownRight1: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="m7.217 5.236-1.98 1.98c-.396.396-.594.594-.668.822a1 1 0 0 0 0 .618c.074.23.272.427.668.823l7.017 7.017a61 61 0 0 1-3.062 2.595c3.011.451 6.069.511 9.096.177a1.11 1.11 0 0 0 .98-.98 35.2 35.2 0 0 0-.177-9.097 61 61 0 0 1-2.595 3.063L9.48 5.236c-.396-.396-.594-.594-.823-.668a1 1 0 0 0-.618 0c-.228.074-.426.272-.822.668Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="m5.237 7.217 1.98-1.98c.395-.396.593-.594.822-.669a1 1 0 0 1 .618 0c.228.075.426.273.822.669l7.017 7.017a61 61 0 0 0 2.595-3.063 35.3 35.3 0 0 1 .177 9.097 1.11 1.11 0 0 1-.98.98 35.3 35.3 0 0 1-9.097-.177 61 61 0 0 0 3.062-2.595L5.237 9.48c-.396-.396-.594-.594-.669-.822a1 1 0 0 1 0-.618c.075-.228.273-.426.669-.822Z"
			/>
		</svg>
	)
}

export default IconArrowBigDownRight1
