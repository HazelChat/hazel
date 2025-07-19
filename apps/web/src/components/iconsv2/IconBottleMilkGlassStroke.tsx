// stroke/food
import type { Component, JSX } from "solid-js"

export const IconBottleMilkGlassStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M6 2h7M6 2v3.056c0 .352 0 .528-.024.7a2.5 2.5 0 0 1-.107.451c-.055.165-.134.323-.291.638l-1.156 2.31c-.157.315-.236.473-.291.638a2.5 2.5 0 0 0-.107.45c-.024.173-.024.35-.024.701V18c0 1.4 0 2.1.272 2.635a2.5 2.5 0 0 0 1.093 1.092C5.9 22 6.6 22 8 22h3c.917 0 1.533 0 2-.076M6 2H5m8 0v3.056c0 .352 0 .528.024.7q.033.23.107.451c.055.165.134.323.291.638l1.156 2.31c.157.315.236.473.292.638M13 2h1"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="m10.833 16 .354 2.55c.17 1.223.255 1.834.549 2.294a2.5 2.5 0 0 0 1.066.929c.496.227 1.113.227 2.348.227h.7c1.235 0 1.852 0 2.348-.227a2.5 2.5 0 0 0 1.066-.928c.294-.46.379-1.072.549-2.295l.631-4.55m-9.61 2L10 10h11l-.556 4m-9.61 2 1.406-.888c.552-.349.828-.523 1.12-.62a2.5 2.5 0 0 1 1.326-.066c.3.067.592.213 1.176.505v0c.665.333.998.499 1.336.564a2.5 2.5 0 0 0 1.473-.164c.315-.138.603-.374 1.18-.845l.593-.486"
				fill="none"
			/>
		</svg>
	)
}

export default IconBottleMilkGlassStroke
