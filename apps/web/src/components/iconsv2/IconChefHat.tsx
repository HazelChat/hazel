// solid/food
import type { Component, JSX } from "solid-js"

export const IconChefHat: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M7.416 5a5 5 0 0 1 9.168 0A5.5 5.5 0 0 1 18 15.794a.207.207 0 0 1-.207.207H15v-4a1 1 0 1 0-2 0v4h-2v-2a1 1 0 1 0-2 0v2H6.207A.207.207 0 0 1 6 15.793 5.502 5.502 0 0 1 7.416 5Z"
				fill="currentColor"
			/>
			<path
				d="M6.48 18c-.168 0-.252 0-.316.033a.3.3 0 0 0-.131.13C6 18.229 6 18.313 6 18.48v.156c0 .39 0 .74.024 1.03.025.313.083.644.248.969a2.5 2.5 0 0 0 1.093 1.092c.325.166.656.224.968.25.292.023.642.023 1.03.023h5.273c.39 0 .74 0 1.03-.024.313-.025.644-.083.969-.248a2.5 2.5 0 0 0 1.092-1.093 2.5 2.5 0 0 0 .25-.968c.023-.292.023-.642.023-1.03v-.157c0-.168 0-.252-.033-.316a.3.3 0 0 0-.13-.131C17.771 18 17.687 18 17.52 18z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconChefHat
