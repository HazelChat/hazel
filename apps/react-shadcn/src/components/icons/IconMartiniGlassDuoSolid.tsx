// icons/svgs/duo-solid/food

import type React from "react"
import type { SVGProps } from "react"

export const IconMartiniGlassDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M12 13v8m0 0h5.5M12 21H7"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				fillRule="evenodd"
				d="M3 3a1 1 0 0 0-.707 1.707l9 9a1 1 0 0 0 1.414 0l9-9A1 1 0 0 0 21 3zm3.447 3.033L5.414 5h13.172l-1.033 1.033a71 71 0 0 1-11.106 0Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}

export default IconMartiniGlassDuoSolid
