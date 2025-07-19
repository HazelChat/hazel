// icons/svgs/solid/general

import type React from "react"
import type { SVGProps } from "react"

export const IconTicketTokenOne: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M1 8a5 5 0 0 1 5-5h12a5 5 0 0 1 5 5v.4a1.6 1.6 0 0 1-1.6 1.6 1.4 1.4 0 0 0-1.4 1.4v1.2a1.4 1.4 0 0 0 1.4 1.4 1.6 1.6 0 0 1 1.6 1.6v.4a5 5 0 0 1-5 5H6a5 5 0 0 1-5-5v-.4A1.6 1.6 0 0 1 2.6 14 1.4 1.4 0 0 0 4 12.6v-1.2A1.4 1.4 0 0 0 2.6 10 1.6 1.6 0 0 1 1 8.4zm12 1.377a1 1 0 0 0-1.238-.97c-1.003.245-1.739.932-2.156 1.768A1 1 0 0 0 11 11.488V14h-1a1 1 0 1 0 0 2h4a1 1 0 1 0 0-2h-1z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconTicketTokenOne
