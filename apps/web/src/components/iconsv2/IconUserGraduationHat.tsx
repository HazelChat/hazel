// solid/users
import type { Component, JSX } from "solid-js"

export const IconUserGraduationHat: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M11.725 1.038a1 1 0 0 1 .55 0l7 2a1 1 0 0 1 0 1.924l-2.456.701a5 5 0 1 1-9.638 0L6 5.326V7a1 1 0 0 1-2 0V4a1 1 0 0 1 .725-.962zm3.17 5.175-2.62.749a1 1 0 0 1-.55 0l-2.62-.75Q9 6.59 9 7a3 3 0 1 0 5.896-.787Z"
				clip-rule="evenodd"
				fill="currentColor"
			/>
			<path
				d="M3 19a5 5 0 0 1 5-5h8a5 5 0 0 1 5 5 3 3 0 0 1-3 3H6a3 3 0 0 1-3-3Z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconUserGraduationHat
