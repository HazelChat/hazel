// solid/users
import type { Component, JSX } from "solid-js"

export const IconUserCircleDotted: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M12 1a1 1 0 1 0 0 2h.01a1 1 0 1 0 0-2zm3.826.761a1 1 0 1 0 0 2h.01a1 1 0 1 0 0-2zm-8.656 1a1 1 0 0 1 1-1h.01a1 1 0 1 1 0 2h-.01a1 1 0 0 1-1-1Zm11.894 1.163a1 1 0 1 0 0 2h.01a1 1 0 0 0 0-2zm-15.135 1a1 1 0 0 1 1-1h.01a1 1 0 0 1 0 2h-.01a1 1 0 0 1-1-1Zm17.296 2.23a1 1 0 0 0 0 2h.01a1 1 0 1 0 0-2zm-19.468 1a1 1 0 0 1 1-1h.01a1 1 0 0 1 0 2h-.01a1 1 0 0 1-1-1ZM22 11a1 1 0 1 0 0 2h.01a1 1 0 1 0 0-2zM1 12a1 1 0 0 1 1-1h.01a1 1 0 1 1 0 2H2a1 1 0 0 1-1-1Zm20.22 2.872a1 1 0 1 0 0 2h.01a1 1 0 1 0 0-2zm-19.453 1a1 1 0 0 1 1-1h.01a1 1 0 1 1 0 2h-.01a1 1 0 0 1-1-1ZM8 10a4 4 0 1 1 8 0 4 4 0 0 1-8 0Zm-3.993 9.089C4.142 16.767 6.142 15 8.5 15h7c2.358 0 4.358 1.767 4.493 4.089a1 1 0 0 1-.299.772A10.97 10.97 0 0 1 12 23a10.97 10.97 0 0 1-7.694-3.139 1 1 0 0 1-.299-.772Z"
				clip-rule="evenodd"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconUserCircleDotted
