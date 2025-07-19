// duo-solid/users
import type { Component, JSX } from "solid-js"

export const IconUserUser01DuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<path fill="currentColor" d="M7 14a4 4 0 0 0 0 8h10a4 4 0 0 0 0-8z" opacity=".28" />
			<path fill="currentColor" d="M12 2.25a4.75 4.75 0 1 0 0 9.5 4.75 4.75 0 0 0 0-9.5Z" />
		</svg>
	)
}

export default IconUserUser01DuoSolid
