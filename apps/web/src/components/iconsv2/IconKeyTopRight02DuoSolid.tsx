// duo-solid/security
import type { Component, JSX } from "solid-js"

export const IconKeyTopRight02DuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M11.109 10.563a1 1 0 0 0-.39-.24 5.5 5.5 0 1 0 3.459 3.457 1 1 0 0 0-.241-.388l1.745-1.745v-1.622a.5.5 0 0 1 .5-.5h1.62l2.122-2.12v-2.83h-2.828z"
				clip-rule="evenodd"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2.2"
				d="M8.964 16.95 7.55 15.537a1.25 1.25 0 0 0 1.414 1.415z"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="m10.732 10.94 6.364-6.364h2.828v2.828l-2.12 2.121h-1.622a.5.5 0 0 0-.5.5v1.622l-2.122 2.121"
			/>
		</svg>
	)
}

export default IconKeyTopRight02DuoSolid
