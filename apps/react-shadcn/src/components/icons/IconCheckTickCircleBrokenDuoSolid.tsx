// icons/svgs/duo-solid/general

import type React from "react"
import type { SVGProps } from "react"

export const IconCheckTickCircleBrokenDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M12 1.85C6.394 1.85 1.85 6.394 1.85 12S6.394 22.15 12 22.15 22.15 17.606 22.15 12 17.606 1.85 12 1.85Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="m21.035 5.403-.793.541a25.64 25.64 0 0 0-7.799 8.447l-.359.629L8.61 11"
			/>
		</svg>
	)
}

export default IconCheckTickCircleBrokenDuoSolid
