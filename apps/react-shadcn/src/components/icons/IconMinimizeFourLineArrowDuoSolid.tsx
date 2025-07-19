// icons/svgs/duo-solid/arrows-&-chevrons

import type React from "react"
import type { SVGProps } from "react"

export const IconMinimizeFourLineArrowDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M15.222 15.222 21 21M8.778 8.778 3 3m5.778 12.222L3 21M15.222 8.778 21 3"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				d="M9.923 8.548a18.3 18.3 0 0 0-.177-4.713 1 1 0 0 0-1.754-.476l-.793.948A23 23 0 0 1 4.307 7.2l-.948.793a1 1 0 0 0 .476 1.754c1.566.262 3.15.322 4.713.177a1.52 1.52 0 0 0 1.375-1.375Z"
			/>
			<path
				fill="currentColor"
				d="M14.254 3.835a18.3 18.3 0 0 0-.177 4.713 1.52 1.52 0 0 0 1.375 1.375c1.563.145 3.147.085 4.713-.177a1 1 0 0 0 .476-1.754l-.948-.793A23 23 0 0 1 16.8 4.307l-.793-.948a1 1 0 0 0-1.754.476Z"
			/>
			<path
				fill="currentColor"
				d="M20.165 14.254a18.3 18.3 0 0 0-4.713-.177 1.52 1.52 0 0 0-1.375 1.375 18.3 18.3 0 0 0 .177 4.713 1 1 0 0 0 1.754.476l.793-.948a23 23 0 0 1 2.892-2.892l.948-.793a1 1 0 0 0-.476-1.754Z"
			/>
			<path
				fill="currentColor"
				d="M9.746 20.165c.262-1.566.322-3.15.177-4.713a1.52 1.52 0 0 0-1.375-1.375 18.3 18.3 0 0 0-4.713.177 1 1 0 0 0-.476 1.754l.948.793A23 23 0 0 1 7.2 19.693l.793.948a1 1 0 0 0 1.754-.476Z"
			/>
		</svg>
	)
}

export default IconMinimizeFourLineArrowDuoSolid
