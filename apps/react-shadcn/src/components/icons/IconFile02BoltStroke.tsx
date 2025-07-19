// icons/svgs/stroke/files-&-folders

import type React from "react"
import type { SVGProps } from "react"

export const IconFile02BoltStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M20 11v7a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V6a4 4 0 0 1 4-4h3m9 9v-1a8 8 0 0 0-8-8h-1m9 9a3 3 0 0 0-3-3h-.6c-.372 0-.557 0-.713-.025a2 2 0 0 1-1.662-1.662C14 6.157 14 5.972 14 5.6V5a3 3 0 0 0-3-3m1 8.5-1.802 2.403c-.374.498-.561.748-.548.934a.5.5 0 0 0 .238.391c.16.098.467.046 1.082-.056l2.06-.344c.615-.102.923-.153 1.082-.056a.5.5 0 0 1 .238.391c.013.186-.174.436-.548.934L12 17.5"
				fill="none"
			/>
		</svg>
	)
}

export default IconFile02BoltStroke
