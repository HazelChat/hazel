// solid/general
import type { Component, JSX } from "solid-js"

export const IconListCheckBox: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M4 4a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h3a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"
				fill="currentColor"
			/>
			<path d="M12 5a1 1 0 1 0 0 2h9a1 1 0 1 0 0-2z" fill="currentColor" />
			<path d="M12 11a1 1 0 1 0 0 2h9a1 1 0 1 0 0-2z" fill="currentColor" />
			<path
				d="M9.155 14.826a1 1 0 1 0-1.128-1.652 13.1 13.1 0 0 0-3.302 3.24l-1.018-1.017a1 1 0 0 0-1.414 1.415l1.898 1.895a1 1 0 0 0 1.574-.21 11.15 11.15 0 0 1 3.39-3.671Z"
				fill="currentColor"
			/>
			<path d="M12 17a1 1 0 1 0 0 2h9a1 1 0 1 0 0-2z" fill="currentColor" />
		</svg>
	)
}

export default IconListCheckBox
