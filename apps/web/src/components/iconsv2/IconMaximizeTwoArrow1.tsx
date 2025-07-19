// contrast/arrows-&-chevrons
import type { Component, JSX } from "solid-js"

export const IconMaximizeTwoArrow1: Component<JSX.IntrinsicElements["svg"]> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<g fill="currentColor" opacity=".28">
				<path
					fill="currentColor"
					d="M12 6.289a20.8 20.8 0 0 1 5.347-.202.625.625 0 0 1 .566.566A20.8 20.8 0 0 1 17.71 12l-.046-.06a32 32 0 0 0-5.605-5.605z"
				/>
				<path
					fill="currentColor"
					d="M12 17.711a20.8 20.8 0 0 1-5.347.202.624.624 0 0 1-.566-.566A20.8 20.8 0 0 1 6.29 12l.046.06a32 32 0 0 0 5.605 5.605z"
				/>
			</g>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M17.347 6.087A20.8 20.8 0 0 0 12 6.29l3.212 2.499 2.5 3.212c.297-1.779.365-3.576.2-5.347a.624.624 0 0 0-.565-.566Z"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M6.653 17.913c1.771.164 3.568.096 5.347-.202l-3.212-2.499L6.288 12a20.8 20.8 0 0 0-.2 5.347.625.625 0 0 0 .565.566Z"
			/>
		</svg>
	)
}

export default IconMaximizeTwoArrow1
