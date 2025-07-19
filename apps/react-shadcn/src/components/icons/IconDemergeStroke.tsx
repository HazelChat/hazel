// icons/svgs/stroke/arrows-&-chevrons

import type React from "react"
import type { SVGProps } from "react"

export const IconDemergeStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M9.943 4.286a20.6 20.6 0 0 0-5.296-.2.62.62 0 0 0-.383.178m.022 5.679a20.6 20.6 0 0 1-.2-5.296.62.62 0 0 1 .178-.383m0 0L12 12v8m2.057-15.714a20.6 20.6 0 0 1 5.296-.2c.15.014.284.079.383.178m-.022 5.679a20.6 20.6 0 0 0 .2-5.296.62.62 0 0 0-.178-.383m0 0L15 9"
				fill="none"
			/>
		</svg>
	)
}

export default IconDemergeStroke
