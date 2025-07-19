// icons/svgs/duo-solid/navigation

import type React from "react"
import type { SVGProps } from "react"

export const IconTargetCenterDuoSolid: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M10.418 1.972A10 10 0 0 1 12 1.85c5.606 0 10.15 4.544 10.15 10.15q0 .216-.009.431c-.227 5.406-4.68 9.72-10.14 9.72q-.797 0-1.583-.124c-4.716-.739-8.354-4.722-8.559-9.595A10 10 0 0 1 1.85 12c0-5.069 3.714-9.267 8.568-10.028ZM12 5a7.002 7.002 0 0 0 0 14 7 7 0 1 0 0-14Zm-.78 2.06a5 5 0 1 1 1.564 9.879A5 5 0 0 1 11.22 7.06z"
				clipRule="evenodd"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				d="M11 21.15V13H2.85a1 1 0 0 1 0-2H11V2.85a1 1 0 1 1 2 0V11h8.15l.102.005a1 1 0 0 1 0 1.99L21.15 13H13v8.149a1 1 0 0 1-2 0Z"
			/>
		</svg>
	)
}

export default IconTargetCenterDuoSolid
