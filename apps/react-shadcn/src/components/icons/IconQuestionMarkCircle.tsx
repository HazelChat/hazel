// icons/svgs/solid/alerts

import type React from "react"
import type { SVGProps } from "react"

export const IconQuestionMarkCircle: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm8.282-2.281a1.719 1.719 0 1 1 2.652 1.443c-.4.26-.863.606-1.233 1.049C11.327 12.658 11 13.259 11 14a1 1 0 1 0 2 0c0-.123.05-.286.234-.505.188-.225.465-.446.789-.656a3.719 3.719 0 1 0-5.741-3.12 1 1 0 0 0 2 0ZM12 16a1 1 0 1 0 0 2h.001a1 1 0 1 0 0-2z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconQuestionMarkCircle
