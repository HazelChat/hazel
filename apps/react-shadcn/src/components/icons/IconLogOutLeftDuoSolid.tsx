// icons/svgs/duo-solid/general

import type React from "react"
import type { SVGProps } from "react"

export const IconLogOutLeftDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M11 4.528A6 6 0 0 1 21 9v6a6 6 0 0 1-10 4.472"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				d="M6.807 9.1a1 1 0 0 0-1.595-.9 16 16 0 0 0-2.832 2.727 1.7 1.7 0 0 0 0 2.146A16 16 0 0 0 5.212 15.8a1 1 0 0 0 1.595-.9 54 54 0 0 0-.099-.884c-.04-.35-.08-.686-.11-1.016H16a1 1 0 1 0 0-2H6.599c.029-.33.068-.666.11-1.016q.05-.423.098-.884Z"
			/>
		</svg>
	)
}

export default IconLogOutLeftDuoSolid
