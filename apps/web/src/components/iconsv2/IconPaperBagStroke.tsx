// stroke/general
import type { Component, JSX } from "solid-js"

export const IconPaperBagStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M15 8a3 3 0 1 1-6 0m.698-4h4.604c1.67 0 2.506 0 3.185.303a3.5 3.5 0 0 1 1.478 1.24c.416.616.561 1.439.852 3.084l.857 4.86c.456 2.583.684 3.873.317 4.88a4 4 0 0 1-1.758 2.097c-.929.536-2.24.536-4.861.536H9.628c-2.621 0-3.932 0-4.86-.536a4 4 0 0 1-1.76-2.096c-.366-1.008-.138-2.298.318-4.88l.858-4.861c.29-1.645.435-2.468.851-3.084a3.5 3.5 0 0 1 1.478-1.24C7.193 4 8.028 4 9.698 4Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconPaperBagStroke
