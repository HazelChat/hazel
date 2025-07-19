// icons/svgs/solid/general

import type React from "react"
import type { SVGProps } from "react"

export const IconFaceSadDisappointed: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M1.85 12C1.85 6.394 6.394 1.85 12 1.85S22.15 6.394 22.15 12c0 5.605-4.544 10.15-10.15 10.15S1.85 17.605 1.85 12Zm13.124-3.69a1 1 0 1 0-1.148 1.64l1.23.86a1 1 0 1 0 1.146-1.639zm-4.792 1.64a1 1 0 0 0-1.147-1.64l-1.228.861a1 1 0 0 0 1.147 1.639zM7.73 16.813a1 1 0 0 0 1.414-.014A4 4 0 0 1 12 15.6c1.12 0 2.13.458 2.857 1.2a1 1 0 0 0 1.428-1.4A6 6 0 0 0 12 13.6c-1.678 0-3.197.69-4.285 1.8a1 1 0 0 0 .014 1.414Z"
				clipRule="evenodd"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconFaceSadDisappointed
