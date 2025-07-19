// icons/svgs/contrast/apps-&-social

import type React from "react"
import type { SVGProps } from "react"

export const IconFigma1: React.FC<SVGProps<SVGSVGElement>> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<g fill="currentColor" opacity=".28">
				<path
					fill="currentColor"
					d="M5 5.5A3.5 3.5 0 0 1 8.5 2h7a3.5 3.5 0 1 1 0 7H12v10.5A3.5 3.5 0 1 1 8.5 16a3.5 3.5 0 1 1 0-7A3.5 3.5 0 0 1 5 5.5Z"
				/>
				<path fill="currentColor" d="M12 12.5a3.5 3.5 0 1 0 7 0 3.5 3.5 0 0 0-7 0Z" />
			</g>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M12 2H8.5a3.5 3.5 0 1 0 0 7M12 2v7m0-7h3.5a3.5 3.5 0 1 1 0 7M12 9H8.5M12 9v7m0-7h3.5m-7 0a3.5 3.5 0 1 0 0 7m3.5 0H8.5m3.5 0v3.5A3.5 3.5 0 1 1 8.5 16m7-7a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7Z"
			/>
		</svg>
	)
}

export default IconFigma1
