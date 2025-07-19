// icons/svgs/duo-solid/general

import type React from "react"
import type { SVGProps } from "react"

export const IconThumbReactionLikeDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				fillRule="evenodd"
				d="M2 11.5a3.5 3.5 0 1 1 7 0v6a3.5 3.5 0 1 1-7 0zM5.5 10A1.5 1.5 0 0 0 4 11.5v6a1.5 1.5 0 0 0 3 0v-6A1.5 1.5 0 0 0 5.5 10Z"
				clipRule="evenodd"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				d="M9.184 20.565c.485.247 1.002.345 1.564.391.541.045 1.206.045 2.01.045h3.589c.701 0 1.284 0 1.763-.037.5-.038.96-.12 1.405-.322a4 4 0 0 0 1.701-1.465c.266-.41.415-.854.527-1.343.107-.468.193-1.044.297-1.738l.543-3.631c.066-.442.125-.834.145-1.161.022-.347.01-.723-.136-1.101a2.5 2.5 0 0 0-1.1-1.277c-.352-.2-.723-.267-1.069-.297-.326-.028-.723-.028-1.17-.028h-2.425c-.168 0-.344.012-.511-.01-.323-.06-.469-.391-.366-.68.117-.334.267-.658.37-.996a4 4 0 0 0-.801-3.795 5 5 0 0 0-.628-.625 2 2 0 0 0-2.763.245 3 3 0 0 0-.2.266l-3.084 4.43c-.586.843-.955 1.373-1.22 1.957a7 7 0 0 0-.509 1.62c-.103.559-.114 1.116-.116 1.922v2.8c.003 1.264.016 2.256.436 3.082a4 4 0 0 0 1.748 1.748Z"
			/>
		</svg>
	)
}

export default IconThumbReactionLikeDuoSolid
