// solid/appliances
import type { Component, JSX } from "solid-js"

export const IconCeilingLampOn: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				fill-rule="evenodd"
				d="M13 2a1 1 0 1 0-2 0v2.05c-5.053.5-9 4.764-9 9.95a1 1 0 0 0 1 1h5.126a4.002 4.002 0 0 0 7.748 0H21a1 1 0 0 0 1-1c0-5.185-3.947-9.449-9-9.95zm-1 14a2 2 0 0 1-1.732-1h3.464A2 2 0 0 1 12 16Z"
				clip-rule="evenodd"
				fill="currentColor"
			/>
			<path d="M8.866 19.5a1 1 0 1 0-1.732-1l-.5.866a1 1 0 0 0 1.732 1z" fill="currentColor" />
			<path d="M16.866 18.5a1 1 0 1 0-1.732 1l.5.866a1 1 0 1 0 1.732-1z" fill="currentColor" />
			<path d="M13 20a1 1 0 1 0-2 0v1a1 1 0 1 0 2 0z" fill="currentColor" />
		</svg>
	)
}

export default IconCeilingLampOn
