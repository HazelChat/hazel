// stroke/time
import type { Component, JSX } from "solid-js"

export const IconCalendarPlusStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M12 17v-3m0 0v-3m0 3H9m3 0h3m1-12v2.128m0 0V6m0-1.872C15.059 4 13.828 4 12 4s-3.059 0-4 .128m8 0c.498.067.915.17 1.296.329a6 6 0 0 1 3.247 3.247C21 8.807 21 10.204 21 13s0 4.194-.457 5.296a6 6 0 0 1-3.247 3.247C16.194 22 14.796 22 12 22s-4.193 0-5.296-.457a6 6 0 0 1-3.247-3.247C3 17.194 3 15.796 3 13s0-4.193.457-5.296a6 6 0 0 1 3.247-3.247A5 5 0 0 1 8 4.127M8 2v2.128m0 0V6"
				fill="none"
			/>
		</svg>
	)
}

export default IconCalendarPlusStroke
