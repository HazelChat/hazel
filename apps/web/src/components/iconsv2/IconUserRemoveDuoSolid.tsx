// duo-solid/users
import type { Component, JSX } from "solid-js"

export const IconUserRemoveDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M2 19a5 5 0 0 1 5-5h5.17A3 3 0 0 0 15 18h4.9q.1.485.1 1a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3Z"
				opacity=".28"
			/>
			<path fill="currentColor" d="M11 2a5 5 0 1 0 0 10 5 5 0 0 0 0-10Z" />
			<path fill="currentColor" d="M15 14a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2z" />
		</svg>
	)
}

export default IconUserRemoveDuoSolid
