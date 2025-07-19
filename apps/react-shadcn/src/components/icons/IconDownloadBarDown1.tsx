// icons/svgs/contrast/general

import type React from "react"
import type { SVGProps } from "react"

export const IconDownloadBarDown1: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M6 10.17a30.2 30.2 0 0 0 5.406 5.62.95.95 0 0 0 1.188 0A30.2 30.2 0 0 0 18 10.17a43.8 43.8 0 0 1-12 0Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M12 10.583V4m0 6.583c-2.005 0-4.01-.138-6-.413a30.2 30.2 0 0 0 5.406 5.62.95.95 0 0 0 1.188 0A30.2 30.2 0 0 0 18 10.17c-1.99.275-3.995.413-6 .413ZM19 20H5"
			/>
		</svg>
	)
}

export default IconDownloadBarDown1
