// stroke/general
import type { Component, JSX } from "solid-js"

export const IconSquareDashedStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M20.256 17.895A6 6 0 0 1 18 20.196m2.989-10.301C21 10.497 21 11.19 21 12c0 .717 0 1.343-.008 1.895M6 20.196a6 6 0 0 1-2.256-2.302m-.733-8C3 10.498 3 11.19 3 12c0 .717 0 1.343.008 1.895M10 20.99c.577.009 1.237.009 2 .009s1.423 0 2-.01m6.134-15.095A6 6 0 0 0 18 3.804m-8-.795C10.577 3 11.237 3 12 3s1.423 0 2 .01m-8 .794a6 6 0 0 0-2.134 2.09"
				fill="none"
			/>
		</svg>
	)
}

export default IconSquareDashedStroke
