// stroke/building
import type { Component, JSX } from "solid-js"

export const IconBuildingApartmentOneStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M10 6h3m-3 4h3m-3 4h3m-3 4h3M9.2 2h4.6c1.12 0 1.68 0 2.108.218a2 2 0 0 1 .874.874C17 3.52 17 4.08 17 5.2v15.2c0 .56 0 .84-.109 1.054a1 1 0 0 1-.437.437C16.24 22 15.96 22 15.4 22H7.6c-.56 0-.84 0-1.054-.109a1 1 0 0 1-.437-.437C6 21.24 6 20.96 6 20.4V5.2c0-1.12 0-1.68.218-2.108a2 2 0 0 1 .874-.874C7.52 2 8.08 2 9.2 2Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconBuildingApartmentOneStroke
