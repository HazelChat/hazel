// stroke/medical
import type { Component, JSX } from "solid-js"

export const IconEarStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M13.526 2.666a6.41 6.41 0 0 1 2.968 12.089c-.685.358-1.028.537-1.135.644-.164.165-.131.115-.218.331-.056.14-.09.595-.16 1.503-.168 2.204-2.008 4.167-4.413 4.167a4.437 4.437 0 0 1-4.405-4.97c.264-2.21.954-5.129.954-7.355a6.41 6.41 0 0 1 6.409-6.409Z"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M16.532 9.058a2.975 2.975 0 1 0-5.951 0c0 .798-.046 1.552-.182 2.449 2.875.77 2.382 4.196-.37 3.82"
				fill="none"
			/>
		</svg>
	)
}

export default IconEarStroke
