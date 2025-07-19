// contrast/general
import type { Component, JSX } from "solid-js"

export const IconSquareDotted: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M3 12c0-2.796 0-4.193.457-5.296a6 6 0 0 1 3.247-3.247C7.807 3 9.204 3 12 3s4.194 0 5.296.457a6 6 0 0 1 3.247 3.247C21 7.807 21 9.204 21 12s0 4.194-.457 5.296a6 6 0 0 1-3.247 3.247C16.194 21 14.796 21 12 21s-4.193 0-5.296-.457a6 6 0 0 1-3.247-3.247C3 16.194 3 14.796 3 12Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M12 3v.01m0 17.98V21m9-9.005v.01m-18-.01v.01m.457-5.308v.01m17.087-.01v.01M3.457 17.277v.01m17.087-.01v.01M17.3 3.451v.01m-10.587-.01v.01M17.3 20.531v.01m-10.587-.01v.01"
			/>
		</svg>
	)
}

export default IconSquareDotted
