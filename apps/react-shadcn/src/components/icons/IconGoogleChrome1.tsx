// icons/svgs/contrast/apps-&-social

import type React from "react"
import type { SVGProps } from "react"

export const IconGoogleChrome1: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M12 21.15a9.15 9.15 0 1 0 0-18.3 9.15 9.15 0 0 0 0 18.3Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M12 8.246a3.754 3.754 0 1 1 0 7.508 3.754 3.754 0 0 1 0-7.508Zm0 0h8.347M8.753 13.877 4.576 6.651m10.671 7.226-4.169 7.227m0 0q.456.046.922.046A9.15 9.15 0 1 0 4.576 6.651m6.502 14.453A9.15 9.15 0 0 1 4.576 6.651"
			/>
		</svg>
	)
}

export default IconGoogleChrome1
