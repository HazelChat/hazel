// icons/svgs/duo-solid/development

import type React from "react"
import type { SVGProps } from "react"

export const IconGitFork01DuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M12 12h-1.2c-1.68 0-2.52 0-3.162-.327a3 3 0 0 1-1.311-1.311c-.23-.45-.298-.997-.318-1.862H6m6 3.5v3.5m0-3.5h1.2c1.68 0 2.52 0 3.162-.327a3 3 0 0 0 1.311-1.311c.23-.45.298-.997.318-1.862H18"
				opacity=".28"
			/>
			<path fill="currentColor" d="M6 1.5a4 4 0 1 0 0 8h.012A4 4 0 0 0 6 1.5Z" />
			<path fill="currentColor" d="M18 1.5a4 4 0 0 0-.012 8H18a4 4 0 0 0 0-8Z" />
			<path fill="currentColor" d="M12 14.5a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z" />
		</svg>
	)
}

export default IconGitFork01DuoSolid
