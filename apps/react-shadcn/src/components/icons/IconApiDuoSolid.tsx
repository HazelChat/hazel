// icons/svgs/duo-solid/development

import type React from "react"
import type { SVGProps } from "react"

export const IconApiDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M1 10.4c0-2.24 0-3.36.436-4.216a4 4 0 0 1 1.748-1.748C4.04 4 5.16 4 7.4 4h9.2c2.24 0 3.36 0 4.216.436a4 4 0 0 1 1.748 1.748C23 7.04 23 8.16 23 10.4v3.2c0 2.24 0 3.36-.436 4.216a4 4 0 0 1-1.748 1.748C19.96 20 18.84 20 16.6 20H7.4c-2.24 0-3.36 0-4.216-.436a4 4 0 0 1-1.748-1.748C1 16.96 1 15.84 1 13.6z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M12 13V8h2.5a2.5 2.5 0 0 1 0 5zm0 0v3m8-8v8M9 13v-1.867a3.15 3.15 0 0 0-1.98-2.925 1.4 1.4 0 0 0-1.04 0A3.15 3.15 0 0 0 4 11.133V13m5 0v3m0-3H4m0 0v3"
			/>
		</svg>
	)
}

export default IconApiDuoSolid
