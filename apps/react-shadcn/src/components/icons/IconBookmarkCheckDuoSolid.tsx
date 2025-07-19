// icons/svgs/duo-solid/files-&-folders

import type React from "react"
import type { SVGProps } from "react"

export const IconBookmarkCheckDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M11.8 1c-1.668 0-2.748 0-3.654.294a6 6 0 0 0-3.852 3.852C3.999 6.052 4 7.132 4 8.8V22a1 1 0 0 0 1.65.76l1.795-1.538c.935-.802 1.595-1.367 2.148-1.773.544-.398.927-.599 1.288-.704a4 4 0 0 1 2.238 0c.361.105.744.306 1.288.704.553.406 1.213.971 2.149 1.773l1.793 1.537A1 1 0 0 0 20 22V8.8c0-1.669 0-2.748-.294-3.654a6 6 0 0 0-3.852-3.852C14.948.999 13.87 1 12.2 1z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="m9 10.259 2.036 2.034A13 13 0 0 1 15 8"
			/>
		</svg>
	)
}

export default IconBookmarkCheckDuoSolid
