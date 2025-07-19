// contrast/apps-&-social
import type { Component, JSX } from "solid-js"

export const IconSketch1: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M22.126 7.908 19.224 3.84A2 2 0 0 0 17.591 3H6.409c-.648 0-1.256.313-1.633.841L1.874 7.908a2.005 2.005 0 0 0 .109 2.474l8.493 9.916c.4.468.962.702 1.524.702s1.124-.234 1.524-.702l8.493-9.916a2.006 2.006 0 0 0 .11-2.474Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="m17.52 9.025-4.142 9.418L12 21m5.52-11.975H6.48m11.04 0h4.98m-4.98 0L12 3M6.48 9.025l4.142 9.418L12 21M6.48 9.025H1.5m4.98 0L12 3m10.5 6.025a2 2 0 0 0-.374-1.117L19.224 3.84A2 2 0 0 0 17.591 3H12m10.5 6.025a2 2 0 0 1-.483 1.357l-8.493 9.916c-.4.468-.962.702-1.524.702M1.5 9.025c-.011.483.15.969.483 1.357l8.493 9.916c.4.468.962.702 1.524.702M1.5 9.025c.01-.391.134-.781.374-1.117L4.776 3.84A2 2 0 0 1 6.409 3H12"
			/>
		</svg>
	)
}

export default IconSketch1
