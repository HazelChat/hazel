// duo-solid/appliances
import type { Component, JSX } from "solid-js"

export const IconCeilingLampOnDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M3 15a1 1 0 0 1-1-1C2 8.477 6.477 4 12 4s10 4.477 10 10a1 1 0 0 1-1 1z"
				clip-rule="evenodd"
				opacity=".28"
			/>
			<path fill="currentColor" d="M13 2a1 1 0 1 0-2 0v2.05a10 10 0 0 1 2 0z" />
			<path fill="currentColor" d="M8.126 15a4.002 4.002 0 0 0 7.748 0h-2.141a2 2 0 0 1-3.465 0z" />
			<path fill="currentColor" d="M8.866 19.5a1 1 0 1 0-1.732-1l-.5.866a1 1 0 0 0 1.732 1z" />
			<path fill="currentColor" d="M16.866 18.5a1 1 0 1 0-1.732 1l.5.866a1 1 0 0 0 1.732-1z" />
			<path fill="currentColor" d="M13 20a1 1 0 1 0-2 0v1a1 1 0 1 0 2 0z" />
		</svg>
	)
}

export default IconCeilingLampOnDuoSolid
