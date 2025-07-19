// icons/svgs/duo-solid/users

import type React from "react"
import type { SVGProps } from "react"

export const IconUserArrowDownDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M16 14.1a5 5 0 0 0-1-.1H7a5 5 0 0 0-5 5 3 3 0 0 0 3 3h9.417a18 18 0 0 1-.817-1.012 3 3 0 0 1 2.4-4.8z"
				opacity=".28"
			/>
			<path fill="currentColor" d="M6 7a5 5 0 1 1 10 0A5 5 0 0 1 6 7Z" />
			<path
				fill="currentColor"
				d="M19 23c-.38 0-.76-.127-1.073-.38a16 16 0 0 1-2.727-2.832 1 1 0 1 1 1.6-1.2q.555.74 1.2 1.398V15a1 1 0 1 1 2 0v4.986q.645-.658 1.2-1.398a1 1 0 1 1 1.6 1.2 16 16 0 0 1-2.727 2.832c-.312.253-.693.38-1.073.38Z"
			/>
		</svg>
	)
}

export default IconUserArrowDownDuoSolid
