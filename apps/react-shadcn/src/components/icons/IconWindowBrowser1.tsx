// icons/svgs/contrast/devices

import type React from "react"
import type { SVGProps } from "react"

export const IconWindowBrowser1: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M16.2 4.47c1.68 0 2.52 0 3.162.328a3 3 0 0 1 1.311 1.31C21 6.752 21 7.592 21 9.272v6.4c0 1.68 0 2.52-.327 3.162a3 3 0 0 1-1.311 1.31c-.642.328-1.482.328-3.162.328H7.8c-1.68 0-2.52 0-3.162-.327a3 3 0 0 1-1.311-1.311C3 18.19 3 17.35 3 15.67v-6.4c0-1.68 0-2.52.327-3.162a3 3 0 0 1 1.311-1.311C5.28 4.47 6.12 4.47 7.8 4.47z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M16.2 4c1.68 0 2.52 0 3.162.327a3 3 0 0 1 1.311 1.311C21 6.28 21 7.12 21 8.8v6.4c0 1.68 0 2.52-.327 3.162a3 3 0 0 1-1.311 1.311C18.72 20 17.88 20 16.2 20H7.8c-1.68 0-2.52 0-3.162-.327a3 3 0 0 1-1.311-1.311C3 17.72 3 16.88 3 15.2V8.8c0-1.68 0-2.52.327-3.162a3 3 0 0 1 1.311-1.311C5.28 4 6.12 4 7.8 4z"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M7 7h.01M10 7h.01M13 7h.01"
			/>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M21 10H3"
			/>
		</svg>
	)
}

export default IconWindowBrowser1
