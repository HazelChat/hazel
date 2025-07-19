// icons/svgs/solid/apps-&-social

import type React from "react"
import type { SVGProps } from "react"

export const IconFacebook: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M11.772 2c-2.295 0-3.71 0-4.883.41a7.3 7.3 0 0 0-4.48 4.479C2 8.062 2 9.477 2 11.772v.456c0 2.295 0 3.71.41 4.883a7.3 7.3 0 0 0 4.479 4.48c.836.292 1.795.376 3.107.4V14h-1.25a1 1 0 1 1 0-2h1.25c0-.655.002-1.199.034-1.646.034-.481.108-.93.298-1.357a3.44 3.44 0 0 1 1.394-1.58c.416-.243.855-.336 1.304-.378C13.448 7 13.96 7 14.553 7h.043a1 1 0 1 1 0 2c-.649 0-1.066.001-1.384.03-.302.029-.419.076-.484.114a1.44 1.44 0 0 0-.573.667c-.055.123-.103.31-.13.686-.027.364-.028.83-.029 1.503h2.75a1 1 0 1 1 0 2h-2.75v8h.232c2.295 0 3.71 0 4.883-.41a7.3 7.3 0 0 0 4.48-4.479c.41-1.173.41-2.588.41-4.883v-.456c0-2.295 0-3.71-.41-4.883a7.3 7.3 0 0 0-4.48-4.48C15.938 2 14.523 2 12.228 2z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconFacebook
