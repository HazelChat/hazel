// icons/svgs/stroke/files-&-folders

import type React from "react"
import type { SVGProps } from "react"

export const IconFile02CodeStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M20 11v7a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V6a4 4 0 0 1 4-4h3m9 9v-1a8 8 0 0 0-8-8h-1m9 9a3 3 0 0 0-3-3h-.6c-.372 0-.557 0-.713-.025a2 2 0 0 1-1.662-1.662C14 6.157 14 5.972 14 5.6V5a3 3 0 0 0-3-3m2.714 14.835a11.6 11.6 0 0 0 2.226-2.115.27.27 0 0 0 0-.34 11.6 11.6 0 0 0-2.226-2.116m-3.428 0a11.6 11.6 0 0 0-2.226 2.115.27.27 0 0 0 0 .34c.642.798 1.39 1.51 2.226 2.116"
				fill="none"
			/>
		</svg>
	)
}

export default IconFile02CodeStroke
