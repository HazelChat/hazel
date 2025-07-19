// icons/svgs/duo-solid/building

import type React from "react"
import type { SVGProps } from "react"

export const IconDoorDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M2 21h20"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				fillRule="evenodd"
				d="M15.943 2.004q.43.005.78.033c.48.04.934.125 1.366.345l.241.135a3.5 3.5 0 0 1 1.288 1.394l.077.163c.164.383.234.784.268 1.202C20 5.743 20 6.316 20 7v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7c0-.684-.001-1.257.037-1.724.04-.478.125-.933.345-1.365l.135-.241A3.5 3.5 0 0 1 5.91 2.382l.163-.077c.383-.164.784-.234 1.202-.268C7.743 2 8.316 2 9 2h6zM8.5 10.5A1.5 1.5 0 1 0 9.615 13H10a1 1 0 1 0 0-2h-.385a1.5 1.5 0 0 0-1.115-.5Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}

export default IconDoorDuoSolid
