// icons/svgs/solid/users

import type React from "react"
import type { SVGProps } from "react"

export const IconUserSpeaking: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M20.345 1.11a1 1 0 0 1 1.346.435A11.95 11.95 0 0 1 23 7c0 1.962-.472 3.817-1.309 5.455a1 1 0 1 1-1.78-.91A9.95 9.95 0 0 0 21 7a9.95 9.95 0 0 0-1.09-4.545 1 1 0 0 1 .435-1.345Z"
				fill="currentColor"
			/>
			<path
				d="M17.625 3.073a1 1 0 0 1 1.302.552A9 9 0 0 1 19.58 7a9 9 0 0 1-.654 3.375 1 1 0 1 1-1.854-.75c.328-.81.508-1.695.508-2.625s-.18-1.816-.508-2.625a1 1 0 0 1 .552-1.302Z"
				fill="currentColor"
			/>
			<path
				d="M2 19a5 5 0 0 1 5-5h8a5 5 0 0 1 5 5 3 3 0 0 1-3 3H5a3 3 0 0 1-3-3Z"
				fill="currentColor"
			/>
			<path d="M11 2.25a4.75 4.75 0 1 0 0 9.5 4.75 4.75 0 0 0 0-9.5Z" fill="currentColor" />
		</svg>
	)
}

export default IconUserSpeaking
