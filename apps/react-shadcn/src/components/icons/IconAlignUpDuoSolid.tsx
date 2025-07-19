// icons/svgs/duo-solid/arrows-&-chevrons

import type React from "react"
import type { SVGProps } from "react"

export const IconAlignUpDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M5 4h14"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				d="M13 20a1 1 0 1 1-2 0v-7.124q-1.503.03-3.003.152a1 1 0 0 1-.886-1.59 21.8 21.8 0 0 1 3.853-4.069 1.64 1.64 0 0 1 2.072 0 21.8 21.8 0 0 1 3.852 4.069 1 1 0 0 1-.886 1.59q-1.499-.122-3.002-.152z"
			/>
		</svg>
	)
}

export default IconAlignUpDuoSolid
