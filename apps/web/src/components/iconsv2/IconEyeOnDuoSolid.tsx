// duo-solid/security
import type { Component, JSX } from "solid-js"

export const IconEyeOnDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M12 4C8.933 4 6.446 5.396 4.745 7.029a11 11 0 0 0-1.988 2.55C2.307 10.394 2 11.257 2 12s.307 1.606.757 2.42a11 11 0 0 0 1.988 2.551C6.446 18.604 8.933 20 12 20s5.554-1.396 7.255-3.029a11 11 0 0 0 1.988-2.55c.45-.815.757-1.678.757-2.421s-.307-1.606-.757-2.42a11 11 0 0 0-1.988-2.551C17.554 5.396 15.067 4 12 4Z"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				fill-rule="evenodd"
				d="M8 12a4 4 0 1 1 8 0 4 4 0 0 1-8 0Zm4-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z"
				clip-rule="evenodd"
			/>
		</svg>
	)
}

export default IconEyeOnDuoSolid
