// icons/svgs/duo-solid/general

import type React from "react"
import type { SVGProps } from "react"

export const IconThumbReactionDislikeDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M21 12.5v-6a2.5 2.5 0 0 0-5 0v6a2.5 2.5 0 0 0 5 0Z"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				d="M14.816 3.436c-.485-.247-1.002-.346-1.564-.392C12.71 3 12.046 3 11.242 3h-3.59c-.701 0-1.283 0-1.762.037-.5.038-.961.12-1.406.322a4 4 0 0 0-1.701 1.465c-.266.41-.415.854-.527 1.343-.107.468-.193 1.044-.297 1.738l-.543 3.631c-.066.441-.124.834-.145 1.161-.022.346-.01.723.136 1.1a2.5 2.5 0 0 0 1.1 1.278c.353.2.723.267 1.069.297a15 15 0 0 0 1.17.028h2.425c.169 0 .344-.012.511.009.323.061.469.392.366.681-.117.334-.267.658-.37.996a4 4 0 0 0 .801 3.794c.187.216.404.445.628.626a2 2 0 0 0 2.763-.246c.073-.083.142-.183.2-.266l3.084-4.43c.587-.842.955-1.372 1.22-1.956a7 7 0 0 0 .509-1.62c.103-.56.114-1.117.116-1.922V8.265c-.003-1.263-.015-2.256-.436-3.081a4 4 0 0 0-1.748-1.748Z"
			/>
		</svg>
	)
}

export default IconThumbReactionDislikeDuoSolid
