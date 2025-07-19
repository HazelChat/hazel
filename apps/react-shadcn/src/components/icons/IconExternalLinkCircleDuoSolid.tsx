// icons/svgs/duo-solid/arrows-&-chevrons

import type React from "react"
import type { SVGProps } from "react"

export const IconExternalLinkCircleDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M19.974 13.5A7.11 7.11 0 0 1 12.89 20H12a8 8 0 0 1-8-8v-.889a7.11 7.11 0 0 1 6.5-7.085"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				d="M14.387 3.253a19.8 19.8 0 0 1 5.174-.15 1.496 1.496 0 0 1 1.336 1.336 19.8 19.8 0 0 1-.15 5.174 1 1 0 0 1-1.749.49l-1.146-1.347q-.275-.322-.56-.634l-6.585 6.585a1 1 0 0 1-1.414-1.414l6.585-6.585q-.312-.285-.634-.56l-1.347-1.146a1 1 0 0 1 .49-1.75Z"
			/>
		</svg>
	)
}

export default IconExternalLinkCircleDuoSolid
