// icons/svgs/stroke/files-&-folders

import type React from "react"
import type { SVGProps } from "react"

export const IconFile02CancelStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M20 11a3 3 0 0 0-3-3h-.6c-.372 0-.557 0-.713-.025a2 2 0 0 1-1.662-1.662C14 6.157 14 5.972 14 5.6V5a3 3 0 0 0-3-3M9.525 16.95 12 14.475m0 0L14.475 12M12 14.475 9.525 12M12 14.475l2.475 2.475M20 10v8a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V6a4 4 0 0 1 4-4h4a8 8 0 0 1 8 8Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconFile02CancelStroke
