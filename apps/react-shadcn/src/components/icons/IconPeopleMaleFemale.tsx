// icons/svgs/solid/users

import type React from "react"
import type { SVGProps } from "react"

export const IconPeopleMaleFemale: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				fillRule="evenodd"
				d="M6 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm-.74 7a4 4 0 0 0-3.986 3.668l-.27 3.25A1 1 0 0 0 2 17h1.065l.232 3.47a2.71 2.71 0 0 0 5.41-.002l.227-3.446 1.042.025a1 1 0 0 0 1.02-1.082l-.272-3.295A4 4 0 0 0 6.738 9zm9.736-4a3 3 0 1 1 6 0 3 3 0 0 1-6 0Zm3.008 4a3.87 3.87 0 0 0-3.807 3.19l-1.18 6.635A1 1 0 0 0 14 20h1.233l.295 1.1a2.563 2.563 0 0 0 4.954-.009L20.77 20H22a1 1 0 0 0 .985-1.174l-1.172-6.632A3.87 3.87 0 0 0 18.004 9Z"
				clipRule="evenodd"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconPeopleMaleFemale
