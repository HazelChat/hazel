// duo-stroke/editing
import type { Component, JSX } from "solid-js"

export const IconScalePencilCrossDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<g
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				opacity=".28"
			>
				<path
					d="M3 3.004 5.727 3c.39 0 .584 0 .767.043q.246.06.46.191c.161.1.299.237.574.514l3.148 3.161-3.699 3.7L3.81 7.426c-.266-.267-.398-.4-.495-.555a1.6 1.6 0 0 1-.19-.445c-.045-.177-.05-.365-.059-.742z"
					fill="none"
				/>
				<path
					d="m20.712 18.857-.034.052a6.3 6.3 0 0 1-1.851 1.84 1.57 1.57 0 0 1-1.964-.212l-3.485-3.5 3.699-3.699 3.424 3.44.061.062a1.6 1.6 0 0 1 .197 1.944z"
					fill="none"
				/>
			</g>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="m4.516 13.07 2.851 2.85m2.851-8.553 2.851 2.851m0-5.702 2.138 2.138m-7.84 3.564 2.138 2.138m-5.56 5.845L5.8 20.054c.798.799 1.198 1.198 1.658 1.347.405.132.84.132 1.246 0 .46-.15.86-.548 1.658-1.347l9.693-9.693c.799-.799 1.198-1.198 1.347-1.658a2 2 0 0 0 0-1.246c-.15-.46-.548-.86-1.347-1.658l-1.853-1.853c-.798-.799-1.198-1.198-1.658-1.347a2 2 0 0 0-1.246 0c-.46.15-.86.548-1.658 1.347l-9.693 9.693c-.799.799-1.198 1.198-1.347 1.658a2 2 0 0 0 0 1.246c.15.46.548.86 1.347 1.658Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconScalePencilCrossDuoStroke
