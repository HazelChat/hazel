// icons/svgs/stroke/apps-&-social

import type React from "react"
import type { SVGProps } from "react"

export const IconFramerStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M12 15v5.87c0 .66 0 .99-.126 1.131a.5.5 0 0 1-.436.164c-.19-.023-.406-.271-.84-.767L5 15m0 0v-4.1c0-.84 0-1.26.163-1.581a1.5 1.5 0 0 1 .656-.656c.32-.163.74-.163 1.581-.163H12M5 15h12.594c.68 0 1.021 0 1.164-.129a.5.5 0 0 0 .16-.442c-.027-.19-.289-.408-.812-.844L12 8.5m0 0h4.6c.84 0 1.26 0 1.581-.163a1.5 1.5 0 0 0 .656-.656C19 7.361 19 6.941 19 6.1V4.4c0-.84 0-1.26-.163-1.581a1.5 1.5 0 0 0-.656-.656C17.861 2 17.441 2 16.6 2H6.436c-.679 0-1.018 0-1.16.129a.5.5 0 0 0-.161.441c.027.19.287.408.807.844z"
				fill="none"
			/>
		</svg>
	)
}

export default IconFramerStroke
