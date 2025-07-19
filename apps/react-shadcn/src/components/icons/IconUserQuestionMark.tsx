// icons/svgs/solid/users

import type React from "react"
import type { SVGProps } from "react"

export const IconUserQuestionMark: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="m15.355 18.332.118.04a3 3 0 0 0 .414 1.653A3 3 0 0 0 15.54 22H6a3 3 0 0 1-3-3 5 5 0 0 1 5-5h5.729a5 5 0 0 0-.209.507 3 3 0 0 0 1.835 3.825Z"
				fill="currentColor"
			/>
			<path d="M12 2.25a4.75 4.75 0 1 0 0 9.5 4.75 4.75 0 0 0 0-9.5Z" fill="currentColor" />
			<path
				fillRule="evenodd"
				d="M18.682 15.018a1.25 1.25 0 0 0-1.389.816 1 1 0 1 1-1.886-.664 3.248 3.248 0 0 1 6.312 1.083c0 1.28-.947 2.102-1.57 2.517a6.3 6.3 0 0 1-1.36.678 1.01 1.01 0 0 1-1.267-.632 1.01 1.01 0 0 1 .632-1.264 4.3 4.3 0 0 0 .886-.446c.502-.335.68-.636.68-.854v-.002a1.25 1.25 0 0 0-1.038-1.232Z"
				clipRule="evenodd"
				fill="currentColor"
			/>
			<path d="M17.5 21.5a1 1 0 0 1 1-1h.01a1 1 0 1 1 0 2h-.01a1 1 0 0 1-1-1Z" fill="currentColor" />
		</svg>
	)
}

export default IconUserQuestionMark
