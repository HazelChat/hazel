// duo-stroke/medical
import type { Component, JSX } from "solid-js"

export const IconMedicalThermometerDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="m5.5 18.5 2.191-.157c.881-.064 1.321-.095 1.734-.217a4 4 0 0 0 1.035-.473c.362-.232.674-.544 1.298-1.169l8.374-8.374a3 3 0 0 0-4.243-4.242l-8.374 8.374c-.624.624-.936.936-1.169 1.298-.206.32-.365.67-.472 1.035-.122.412-.153.853-.217 1.733zm0 0L3 21"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="m5.5 18.5 2.191-.157m-2.191.158.157-2.192c.064-.88.095-1.321.217-1.733a4 4 0 0 1 .472-1.035c.233-.362.545-.674 1.17-1.299l8.373-8.374M5.5 18.501 3 21"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="m11.15 13.85 1.622 1.62m1.107-4.349 1.621 1.621m1-4.242 1.621 1.621"
				fill="none"
			/>
		</svg>
	)
}

export default IconMedicalThermometerDuoStroke
