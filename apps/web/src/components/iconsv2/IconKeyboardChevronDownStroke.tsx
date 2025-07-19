// stroke/devices
import type { Component, JSX } from "solid-js"

export const IconKeyboardChevronDownStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M16 13H8M6 7h.01M10 7h.01M14 7h.01M18 7h.01M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 20.166l3.812 1.524c.439.176.658.264.885.299.2.03.405.03.606 0 .227-.035.446-.123.885-.299L17 20.166M8.4 17h7.2c2.24 0 3.36 0 4.216-.436a4 4 0 0 0 1.748-1.748C22 13.96 22 12.84 22 10.6V9.4c0-2.24 0-3.36-.436-4.216a4 4 0 0 0-1.748-1.748C18.96 3 17.84 3 15.6 3H8.4c-2.24 0-3.36 0-4.216.436a4 4 0 0 0-1.748 1.748C2 6.04 2 7.16 2 9.4v1.2c0 2.24 0 3.36.436 4.216a4 4 0 0 0 1.748 1.748C5.04 17 6.16 17 8.4 17Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconKeyboardChevronDownStroke
