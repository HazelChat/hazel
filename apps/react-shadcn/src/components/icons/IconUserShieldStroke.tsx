// icons/svgs/stroke/users

import type React from "react"
import type { SVGProps } from "react"

export const IconUserShieldStroke: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M11.047 21H6a2 2 0 0 1-2-2 4 4 0 0 1 4-4h2.16M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Zm1.113 7.406-2.306.73a1.09 1.09 0 0 0-.776.978l-.027.617c-.079 1.805.943 3.49 2.626 4.332l.327.163c.323.162.71.166 1.037.01l.284-.135c1.801-.855 2.872-2.664 2.705-4.57l-.04-.452a1.09 1.09 0 0 0-.773-.933l-2.338-.74a1.2 1.2 0 0 0-.719 0Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconUserShieldStroke
