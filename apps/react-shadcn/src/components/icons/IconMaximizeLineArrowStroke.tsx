// icons/svgs/stroke/arrows-&-chevrons

import type React from "react"
import type { SVGProps } from "react"

export const IconMaximizeLineArrowStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M19.714 9.943a20.6 20.6 0 0 0 .2-5.296.62.62 0 0 0-.178-.383m-5.679.022a20.6 20.6 0 0 1 5.296-.2c.15.014.284.079.383.178m0 0L4.264 19.736m.022-5.679a20.6 20.6 0 0 0-.2 5.296c.014.15.079.284.178.383m5.679-.022a20.6 20.6 0 0 1-5.296.2.62.62 0 0 1-.383-.178"
				fill="none"
			/>
		</svg>
	)
}

export default IconMaximizeLineArrowStroke
