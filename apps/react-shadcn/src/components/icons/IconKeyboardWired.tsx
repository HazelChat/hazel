// icons/svgs/solid/devices

import type React from "react"
import type { SVGProps } from "react"

export const IconKeyboardWired: React.FC<SVGProps<SVGSVGElement>> = (props) => {
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
				d="M15.5 0a1 1 0 0 1 1 1A2.5 2.5 0 0 1 14 3.5h-.25a.75.75 0 0 0-.707.5h2.6c1.084 0 1.958 0 2.666.058.729.06 1.369.185 1.961.487a5 5 0 0 1 2.185 2.185c.302.592.428 1.233.487 1.961C23 9.4 23 10.273 23 11.357v1.286c0 1.084 0 1.958-.058 2.666-.06.729-.185 1.369-.487 1.961a5 5 0 0 1-2.185 2.185c-.592.302-1.232.428-1.961.487C17.6 20 16.727 20 15.643 20H8.357c-1.084 0-1.958 0-2.666-.058-.728-.06-1.369-.185-1.961-.487a5 5 0 0 1-2.185-2.185c-.302-.592-.428-1.232-.487-1.961C1 14.6 1 13.727 1 12.643v-1.286c0-1.084 0-1.958.058-2.666.06-.728.185-1.369.487-1.961A5 5 0 0 1 3.73 4.545c.592-.302 1.233-.428 1.961-.487C6.4 4 7.273 4 8.357 4h2.654a2.75 2.75 0 0 1 2.739-2.5H14a.5.5 0 0 0 .5-.5 1 1 0 0 1 1-1ZM6 8a1 1 0 1 0 0 2h.01a1 1 0 1 0 0-2zm4 0a1 1 0 1 0 0 2h.01a1 1 0 1 0 0-2zm4 0a1 1 0 1 0 0 2h.01a1 1 0 1 0 0-2zm4 0a1 1 0 1 0 0 2h.01a1 1 0 1 0 0-2zM6 11a1 1 0 1 0 0 2h.01a1 1 0 1 0 0-2zm4 0a1 1 0 1 0 0 2h.01a1 1 0 1 0 0-2zm4 0a1 1 0 1 0 0 2h.01a1 1 0 1 0 0-2zm4 0a1 1 0 1 0 0 2h.01a1 1 0 1 0 0-2zM8 14a1 1 0 1 0 0 2h8a1 1 0 1 0 0-2z"
				clipRule="evenodd"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconKeyboardWired
