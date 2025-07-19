// icons/svgs/duo-solid/media

import type React from "react"
import type { SVGProps } from "react"

export const IconVolumeZeroDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M18 5.107c0-2.524-2.853-3.993-4.907-2.525L10.28 4.59a3.9 3.9 0 0 1-1.514.655A5.93 5.93 0 0 0 4 11.061v1.918a5.93 5.93 0 0 0 4.766 5.814 3.9 3.9 0 0 1 1.514.655l2.813 2.01C15.147 22.924 18 21.455 18 18.931z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M13.674 20.644c1.392.994 3.326 0 3.326-1.712V5.107c0-1.71-1.934-2.706-3.326-1.711"
			/>
		</svg>
	)
}

export default IconVolumeZeroDuoSolid
