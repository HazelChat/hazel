// solid/users
import type { Component, JSX } from "solid-js"

export const IconUserTwo: Component<JSX.IntrinsicElements["svg"]> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<path d="M4.5 7a5 5 0 1 1 10 0 5 5 0 0 1-10 0Z" fill="currentColor" />
			<path
				d="M1 19a5 5 0 0 1 5-5h7a5 5 0 0 1 5 5 3 3 0 0 1-3 3H4a3 3 0 0 1-3-3Z"
				fill="currentColor"
			/>
			<path
				d="M16.886 2.605a1 1 0 0 0-1.369 1.333c.469.918.733 1.958.733 3.062a6.7 6.7 0 0 1-.733 3.062 1 1 0 0 0 1.369 1.333 5 5 0 0 0 0-8.79Z"
				fill="currentColor"
			/>
			<path
				d="M20.07 14.252a1 1 0 0 0-1.184 1.44c.55.977.864 2.104.864 3.308a4.7 4.7 0 0 1-.295 1.652A1 1 0 0 0 20.393 22h.107a3 3 0 0 0 3-3 5 5 0 0 0-3.43-4.748Z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconUserTwo
