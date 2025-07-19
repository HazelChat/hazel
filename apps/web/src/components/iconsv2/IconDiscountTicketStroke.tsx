// stroke/general
import type { Component, JSX } from "solid-js"

export const IconDiscountTicketStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M8.818 14.364 15.182 8m-6.114.25h.01m5.854 5.864h.01M9.318 8.25a.25.25 0 1 1-.5 0 .25.25 0 0 1 .5 0Zm5.864 5.864a.25.25 0 1 1-.5 0 .25.25 0 0 1 .5 0ZM20 8.4v12.532c0 .208 0 .311-.021.366a.31.31 0 0 1-.43.163c-.052-.027-.12-.104-.258-.259L19.11 21c-.26-.292-.39-.438-.513-.54a2 2 0 0 0-2.529 0c-.124.102-.254.248-.513.54-.13.146-.195.219-.257.27a1 1 0 0 1-1.264 0 3 3 0 0 1-.257-.27c-.26-.292-.39-.438-.514-.54a2 2 0 0 0-2.528 0c-.29.237-.482.575-.77.81a1 1 0 0 1-1.265 0c-.288-.235-.48-.573-.77-.81a2 2 0 0 0-2.529 0c-.338.277-.565.804-.951 1.001-.396.201-.451-.278-.451-.529V8.4c0-2.24 0-3.36.436-4.216a4 4 0 0 1 1.748-1.748C7.04 2 8.16 2 10.4 2h3.2c2.24 0 3.36 0 4.216.436a4 4 0 0 1 1.748 1.748C20 5.04 20 6.16 20 8.4Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconDiscountTicketStroke
