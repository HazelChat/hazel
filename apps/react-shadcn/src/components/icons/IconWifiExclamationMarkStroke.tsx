// icons/svgs/stroke/devices

import type React from "react"
import type { SVGProps } from "react"

export const IconWifiExclamationMarkStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M12 19.5h.01M15 4.78a15.95 15.95 0 0 1 7.806 3.92m-21.613 0A15.95 15.95 0 0 1 9 4.78m-4.268 7.463A11 11 0 0 1 9 9.914m6 0a11 11 0 0 1 4.268 2.329M15 15.303a6 6 0 0 1 .698.472m-7.443.037a6 6 0 0 1 .745-.51M12 4v12"
				fill="none"
			/>
		</svg>
	)
}

export default IconWifiExclamationMarkStroke
