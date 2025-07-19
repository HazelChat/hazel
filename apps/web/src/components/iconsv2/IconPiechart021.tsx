// contrast/chart-&-graph
import type { Component, JSX } from "solid-js"

export const IconPiechart021: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M20.194 11.501a7.424 7.424 0 0 0-9.908-6.998l-.193-.544c-.277-.781-1.142-1.2-1.87-.802a9.5 9.5 0 1 0 12.27 13.878c.484-.674.175-1.585-.567-1.956l-.515-.257c.5-1 .783-2.127.783-3.321Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="m10.286 4.503 2.282 6.428a1.5 1.5 0 0 0 .742.84l6.101 3.05M10.286 4.504a7.424 7.424 0 0 1 9.125 10.32m-9.125-10.32-.193-.544c-.277-.781-1.142-1.2-1.87-.802a9.5 9.5 0 1 0 12.27 13.878c.484-.674.175-1.585-.567-1.956l-.515-.257"
			/>
		</svg>
	)
}

export default IconPiechart021
