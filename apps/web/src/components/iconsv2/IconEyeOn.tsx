// solid/security
import type { Component, JSX } from "solid-js"

export const IconEyeOn: Component<JSX.IntrinsicElements["svg"]> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<path d="M10 12a2 2 0 1 1 4 0 2 2 0 0 1-4 0Z" fill="currentColor" />
			<path
				fill-rule="evenodd"
				d="M4.745 7.029C6.446 5.396 8.933 4 12 4s5.554 1.396 7.255 3.029a11 11 0 0 1 1.988 2.55c.45.815.757 1.678.757 2.421s-.307 1.606-.757 2.42a11 11 0 0 1-1.988 2.551C17.554 18.604 15.067 20 12 20s-5.554-1.396-7.255-3.029a11 11 0 0 1-1.988-2.55C2.307 13.606 2 12.743 2 12s.307-1.606.757-2.42a11 11 0 0 1 1.988-2.551ZM12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z"
				clip-rule="evenodd"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconEyeOn
