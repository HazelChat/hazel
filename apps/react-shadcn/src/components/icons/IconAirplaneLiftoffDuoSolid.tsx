// icons/svgs/duo-solid/automotive

import type React from "react"
import type { SVGProps } from "react"

export const IconAirplaneLiftoffDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				fillRule="evenodd"
				d="M7.93 3.374a4 4 0 0 0-3.26-.54L4.051 3a1 1 0 0 0-.555 1.547l4.13 5.777-1.212.325-2.842-.96a2 2 0 0 0-1.158-.039l-.674.18a1 1 0 0 0-.576 1.518L3.46 14.82a4 4 0 0 0 4.373 1.66L21.2 12.898a2 2 0 0 0 1.415-2.45 4 4 0 0 0-4.9-2.827l-2.459.66z"
				clipRule="evenodd"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M3 20h18"
				opacity=".28"
			/>
		</svg>
	)
}

export default IconAirplaneLiftoffDuoSolid
