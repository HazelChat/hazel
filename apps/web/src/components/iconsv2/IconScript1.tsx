// contrast/development
import type { Component, JSX } from "solid-js"

export const IconScript1: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M5 9.4v5.77A3.001 3.001 0 0 0 6 21h7.6c.816 0 1.483 0 2.043-.021.978-.037 1.629-.138 2.173-.415a4 4 0 0 0 1.748-1.748C20 17.96 20 16.84 20 14.6V9.4c0-2.24 0-3.36-.436-4.216a4 4 0 0 0-1.748-1.748C16.96 3 15.84 3 13.6 3h-2.2c-2.24 0-3.36 0-4.216.436a4 4 0 0 0-1.748 1.748C5 6.04 5 7.16 5 9.4Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="m9 11 2-2-2-2m5 4h2M5 15.17V9.4c0-2.24 0-3.36.436-4.216a4 4 0 0 1 1.748-1.748C8.04 3 9.16 3 11.4 3h2.2c2.24 0 3.36 0 4.216.436a4 4 0 0 1 1.748 1.748C20 6.04 20 7.16 20 9.4v5.2c0 2.24 0 3.36-.436 4.216a4 4 0 0 1-1.748 1.748c-.544.277-1.195.378-2.173.415m0 0C15.083 21 14.416 21 13.6 21H6a3 3 0 1 1 0-6h10a3 3 0 0 0-.357 5.979Zm0 0Q15.819 21 16 21"
			/>
		</svg>
	)
}

export default IconScript1
