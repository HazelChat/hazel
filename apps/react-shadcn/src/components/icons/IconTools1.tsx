// icons/svgs/contrast/general

import type React from "react"
import type { SVGProps } from "react"

export const IconTools1: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
					d="M3.541 2.278a3.5 3.5 0 0 1 4.115 0c.225.163.442.38.718.656L9.94 4.501l.766.766a1 1 0 0 1-.053 1.464l-4.55 3.934a1 1 0 0 1-1.362-.05l-.664-.663-1.36-1.36c-.276-.276-.494-.494-.657-.718a3.5 3.5 0 0 1 0-4.115 7 7 0 0 1 1.481-1.481Z"
				/>
				<path
					fill="currentColor"
					d="M14.892 4.315a3.42 3.42 0 0 0-1.225 3.526l-10.1 8.768a6 6 0 0 0-.402.364c-1.054 1.111-.721 2.616.262 3.6.984.983 2.488 1.316 3.6.262.085-.08.178-.188.363-.4l8.77-10.102a3.42 3.42 0 0 0 3.525-1.225L21.5 6.766l-.616.319a2.944 2.944 0 0 1-3.969-3.969l.32-.616z"
				/>
			</g>
			<path
				stroke="currentColor"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
				d="M13.667 7.84c.144.582.443 1.134.901 1.592s1.01.757 1.591.9m-2.492-2.491a3.42 3.42 0 0 1 1.225-3.526L17.234 2.5l-.319.616a2.944 2.944 0 0 0 3.969 3.969l.616-.32-1.815 2.343a3.42 3.42 0 0 1-3.526 1.225M13.667 7.84l-10.1 8.768a6 6 0 0 0-.402.364c-1.054 1.111-.721 2.616.262 3.6.984.983 2.488 1.316 3.6.262.085-.08.178-.188.363-.4l8.77-10.102m4.996 11.058-5.157-5.156M5.449 9.908l-1.972-1.97c-.328-.33-.492-.493-.608-.653a2.5 2.5 0 0 1 0-2.938c.33-.456.805-.93 1.26-1.26a2.5 2.5 0 0 1 2.94 0c.158.115.323.28.651.608l2.279 2.279"
			/>
		</svg>
	)
}

export default IconTools1
