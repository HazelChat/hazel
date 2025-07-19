// icons/svgs/duo-solid/navigation

import type React from "react"
import type { SVGProps } from "react"

export const IconMapPin02AreaDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M7 15.164c-2.989.562-5 1.613-5 2.816 0 1.794 4.477 3.25 10 3.25s10-1.456 10-3.25c0-1.203-2.011-2.254-5-2.816"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				d="M12 2a5 5 0 0 0-1 9.9V17a1 1 0 1 0 2 0v-5.1A5.002 5.002 0 0 0 12 2Z"
			/>
		</svg>
	)
}

export default IconMapPin02AreaDuoSolid
