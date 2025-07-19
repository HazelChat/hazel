// duo-solid/users
import type { Component, JSX } from "solid-js"

export const IconUserCheckDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M11.505 14H7a5 5 0 0 0-5 5 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3q0-.481-.088-.938-.536.68-.967 1.432a3 3 0 0 1-4.724.633L11.88 17.79a3 3 0 0 1-.375-3.79Z"
				opacity=".28"
			/>
			<path fill="currentColor" d="M6 7a5 5 0 1 1 10 0A5 5 0 0 1 6 7Z" />
			<path
				fill="currentColor"
				d="M21.564 13.826a1 1 0 1 0-1.128-1.652 16.4 16.4 0 0 0-4.274 4.238l-1.455-1.453a1 1 0 1 0-1.414 1.415l2.342 2.338a1 1 0 0 0 1.574-.21c1.07-1.87 2.566-3.454 4.355-4.676Z"
			/>
		</svg>
	)
}

export default IconUserCheckDuoSolid
