// icons/svgs/duo-solid/apps-&-social

import type React from "react"
import type { SVGProps } from "react"

export const IconInstagramDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M11.772 2h.456c2.295 0 3.71 0 4.883.41a7.3 7.3 0 0 1 4.48 4.479c.41 1.173.41 2.588.41 4.883v.456c0 2.295 0 3.71-.41 4.883a7.3 7.3 0 0 1-4.48 4.48c-1.173.41-2.588.41-4.883.41h-.456c-2.295 0-3.71 0-4.883-.41a7.3 7.3 0 0 1-4.48-4.48C2 15.938 2 14.523 2 12.228v-.456c0-2.295 0-3.71.41-4.883a7.3 7.3 0 0 1 4.479-4.48C8.062 2 9.477 2 11.772 2Z"
				opacity=".28"
			/>
			<path fill="currentColor" d="M17.046 6a1 1 0 1 0 0 2h.01a1 1 0 1 0 0-2z" />
			<path fill="currentColor" d="M7.68 12a4.32 4.32 0 1 1 8.64 0 4.32 4.32 0 0 1-8.64 0Z" />
		</svg>
	)
}

export default IconInstagramDuoSolid
