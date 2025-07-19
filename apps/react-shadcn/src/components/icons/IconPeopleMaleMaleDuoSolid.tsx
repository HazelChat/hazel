// icons/svgs/duo-solid/users

import type React from "react"
import type { SVGProps } from "react"

export const IconPeopleMaleMaleDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M5.26 9a4 4 0 0 0-3.986 3.668l-.27 3.25A1 1 0 0 0 2 17h1.065l.232 3.47a2.71 2.71 0 0 0 5.409-.002l.228-3.446 1.042.025a1 1 0 0 0 1.02-1.082l-.272-3.295A4 4 0 0 0 6.738 9zm12 0a4 4 0 0 0-3.986 3.668l-.27 3.25A1 1 0 0 0 14 17h1.065l.232 3.47a2.71 2.71 0 0 0 5.409-.002l.228-3.446 1.042.025a1 1 0 0 0 1.02-1.082l-.272-3.295A4 4 0 0 0 18.738 9z"
				clipRule="evenodd"
			/>
			<g fill="currentColor" opacity=".28">
				<path fill="currentColor" d="M3 5a3 3 0 1 1 6 0 3 3 0 0 1-6 0Z" />
				<path fill="currentColor" d="M18 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
			</g>
		</svg>
	)
}

export default IconPeopleMaleMaleDuoSolid
