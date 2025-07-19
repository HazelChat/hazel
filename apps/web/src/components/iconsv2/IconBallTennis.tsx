// solid/sports
import type { Component, JSX } from "solid-js"

export const IconBallTennis: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M4.752 4.892a10.1 10.1 0 0 0-2.556 4.481c-.47 1.752-.45 3.52-.027 5.159a5 5 0 0 0 2.583-9.64Z"
				fill="currentColor"
			/>
			<path
				d="M2.967 16.628a10.12 10.12 0 0 0 6.406 5.176c2.884.773 5.811.223 8.136-1.279a7.003 7.003 0 0 1 3.525-13.153 10.12 10.12 0 0 0-6.407-5.176 10.12 10.12 0 0 0-8.136 1.28 7.003 7.003 0 0 1-3.524 13.152Z"
				fill="currentColor"
			/>
			<path
				d="M21.804 14.627c.47-1.752.45-3.52.027-5.159a5 5 0 0 0-2.583 9.64 10.1 10.1 0 0 0 2.556-4.48Z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconBallTennis
