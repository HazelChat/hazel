// solid/navigation
import type { Component, JSX } from "solid-js"

export const IconNavigationSlant: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M20.108 2.044a1.556 1.556 0 0 1 1.848 1.848 52.2 52.2 0 0 1-6.866 16.87l-.306.485c-.754 1.198-2.579.89-2.897-.49l-1.348-5.84a1.94 1.94 0 0 0-1.456-1.457l-5.84-1.347c-1.38-.319-1.689-2.144-.49-2.898l.484-.305a52.2 52.2 0 0 1 16.87-6.866Z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconNavigationSlant
