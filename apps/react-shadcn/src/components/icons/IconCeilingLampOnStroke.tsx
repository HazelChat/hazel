// icons/svgs/stroke/appliances

import type React from "react"
import type { SVGProps } from "react"

export const IconCeilingLampOnStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M12 5a9 9 0 0 0-9 9h18a9 9 0 0 0-9-9Zm0 0V2m0 19v-1m4.5-.134L16 19m-8.5.866L8 19m7-5a3 3 0 1 1-6 0z"
				fill="none"
			/>
		</svg>
	)
}

export default IconCeilingLampOnStroke
