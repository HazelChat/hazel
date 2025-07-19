// solid/users
import type { Component, JSX } from "solid-js"

export const IconUserArrowLeft: Component<JSX.IntrinsicElements["svg"]> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<path d="M7 7a5 5 0 1 1 10 0A5 5 0 0 1 7 7Z" fill="currentColor" />
			<path
				d="M14.438 14H8a5 5 0 0 0-5 5 3 3 0 0 0 3 3h8.435a16 16 0 0 1-1.63-1.73 3.6 3.6 0 0 1 0-4.537A16 16 0 0 1 14.437 14Z"
				fill="currentColor"
			/>
			<path
				d="M18.21 14.83a1 1 0 0 1-.2 1.4q-.483.363-.927.771H21a1 1 0 1 1 0 2h-3.916q.443.41.926.772a1 1 0 1 1-1.2 1.6 14 14 0 0 1-2.452-2.362 1.6 1.6 0 0 1 0-2.02 14 14 0 0 1 2.452-2.361 1 1 0 0 1 1.4.2Z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconUserArrowLeft
