// duo-solid/security
import type { Component, JSX } from "solid-js"

export const IconEye02OnDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M5.848 10.383C4.524 11.72 4 13.23 4 14a1 1 0 1 1-2 0c0-1.417.826-3.407 2.427-5.024C6.069 7.318 8.572 6 12 6s5.93 1.318 7.573 2.976C21.174 10.593 22 12.583 22 14a1 1 0 1 1-2 0c0-.77-.524-2.28-1.848-3.617C16.869 9.088 14.872 8 12 8s-4.87 1.088-6.152 2.383Z"
				clip-rule="evenodd"
				opacity=".28"
			/>
			<path fill="currentColor" d="M8.5 14a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0Z" />
		</svg>
	)
}

export default IconEye02OnDuoSolid
