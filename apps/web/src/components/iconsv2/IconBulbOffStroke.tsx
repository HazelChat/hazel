// stroke/appliances
import type { Component, JSX } from "solid-js"

export const IconBulbOffStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M10.379 21h3.242M6.313 10.468c0-3.023 2.546-5.474 5.687-5.474s5.688 2.451 5.688 5.474c0 1.657-.766 3.142-1.974 4.146-.511.424-.95.95-1.117 1.593l-.227.875a1.22 1.22 0 0 1-1.18.912h-2.38a1.22 1.22 0 0 1-1.18-.912l-.227-.875c-.167-.643-.606-1.169-1.117-1.593-1.208-1.004-1.973-2.489-1.973-4.146Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconBulbOffStroke
