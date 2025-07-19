// icons/svgs/contrast/arrows-&-chevrons

import type React from "react"
import type { SVGProps } from "react"

export const IconArrowBigUpRight1: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="m7.217 18.764-1.98-1.98c-.396-.396-.594-.594-.668-.822a1 1 0 0 1 0-.618c.074-.23.272-.427.668-.823l7.017-7.016A61 61 0 0 0 9.192 4.91a35.3 35.3 0 0 1 9.096-.178 1.11 1.11 0 0 1 .98.98 35.2 35.2 0 0 1-.177 9.097 61 61 0 0 0-2.595-3.062L9.48 18.764c-.396.396-.594.594-.823.668a1 1 0 0 1-.618 0c-.228-.074-.426-.272-.822-.668Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="m5.236 16.784 1.98 1.98c.396.396.594.594.823.668a1 1 0 0 0 .618 0c.228-.074.426-.272.822-.668l7.017-7.017a61 61 0 0 1 2.595 3.062 35.3 35.3 0 0 0 .177-9.096 1.11 1.11 0 0 0-.98-.98 35.3 35.3 0 0 0-9.097.177 61 61 0 0 1 3.062 2.594l-7.017 7.017c-.396.396-.594.594-.668.823a1 1 0 0 0 0 .618c.074.228.272.426.668.822Z"
			/>
		</svg>
	)
}

export default IconArrowBigUpRight1
