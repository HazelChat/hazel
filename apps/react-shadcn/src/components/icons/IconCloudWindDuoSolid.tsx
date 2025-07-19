// icons/svgs/duo-solid/weather

import type React from "react"
import type { SVGProps } from "react"

export const IconCloudWindDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M19.465 6.715a7.502 7.502 0 0 0-14.349 1.46 5.5 5.5 0 0 0-3.531 2.853Q1.789 11.001 2 11h7.09a3 3 0 0 1 1.408-3.33 5 5 0 1 1 3.436 9.242c.47.601.808 1.312.966 2.088h1.6a6.5 6.5 0 0 0 2.965-12.285Z"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				fillRule="evenodd"
				d="M13 11a1 1 0 0 0-.5.133 1 1 0 1 1-1-1.731A3 3 0 1 1 13 15H2a1 1 0 1 1 0-2h11a1 1 0 1 0 0-2ZM1 18a1 1 0 0 1 1-1h8a3 3 0 1 1-1.5 5.598 1 1 0 1 1 1-1.731A1 1 0 1 0 10 19H2a1 1 0 0 1-1-1Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}

export default IconCloudWindDuoSolid
