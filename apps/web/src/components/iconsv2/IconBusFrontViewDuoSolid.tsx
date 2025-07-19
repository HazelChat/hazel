// duo-solid/automotive
import type { Component, JSX } from "solid-js"

export const IconBusFrontViewDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				fill-rule="evenodd"
				d="M4 12a1 1 0 0 0-1 1v7.5a2.5 2.5 0 0 0 5 0V20h8v.5a2.5 2.5 0 0 0 5 0V13a1 1 0 0 0-1-1zm2 4a1 1 0 0 1 1-1h1a1 1 0 1 1 0 2H7a1 1 0 0 1-1-1Zm10-1a1 1 0 1 0 0 2h1a1 1 0 1 0 0-2z"
				clip-rule="evenodd"
			/>
			<path
				fill="currentColor"
				fill-rule="evenodd"
				d="M10.292 2h3.416c1.054 0 1.903 0 2.592.055.709.056 1.332.175 1.911.46a5 5 0 0 1 1.902 1.642A4 4 0 0 1 23 8v.5a1.5 1.5 0 0 1-1.5 1.5H21v3a1 1 0 1 1-2 0V9.333c0-1.104 0-1.874-.048-2.475-.047-.588-.135-.928-.261-1.185a3 3 0 0 0-1.364-1.364c-.257-.126-.597-.214-1.186-.26C15.542 4 14.772 4 13.668 4h-3.334C9.23 4 8.46 4 7.858 4.048c-.588.047-.928.135-1.185.261A3 3 0 0 0 5.31 5.673c-.127.257-.214.597-.26 1.185C5 7.458 5 8.228 5 9.333V13a1 1 0 1 1-2 0v-3h-.5A1.5 1.5 0 0 1 1 8.5V8c0-1.823 1.22-3.36 2.887-3.843a5 5 0 0 1 1.902-1.641C6.368 2.23 6.99 2.11 7.7 2.055 8.389 2 9.238 2 10.292 2ZM3.007 7.828A2 2 0 0 0 3 8h.005zM20.995 8H21q0-.087-.007-.173z"
				clip-rule="evenodd"
				opacity=".28"
			/>
		</svg>
	)
}

export default IconBusFrontViewDuoSolid
