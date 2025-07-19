// duo-solid/navigation
import type { Component, JSX } from "solid-js"

export const IconMapTreasureDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M9.553 3.288a3 3 0 0 0-1.106 0c-.417.078-.8.27-1.235.488l-3.001 1.5c-.532.265-.999.498-1.354.86a3 3 0 0 0-.693 1.122C2 7.738 2 8.26 2 8.853v6.069c0 .794 0 1.456.047 1.98.047.534.152 1.074.466 1.54a3 3 0 0 0 2.098 1.297c.557.072 1.088-.076 1.586-.271.49-.193 1.082-.49 1.792-.844l.042-.021c.56-.28.675-.328.777-.348a1 1 0 0 1 .384 0c.102.02.217.067.777.348l3.243 1.62c.435.22.818.411 1.235.49a3 3 0 0 0 1.106 0c.417-.079.8-.27 1.236-.49l3-1.5c.532-.264 1-.497 1.354-.86.312-.318.548-.7.693-1.12.166-.48.165-1.003.164-1.596V9.078c0-.794 0-1.456-.047-1.98-.047-.534-.152-1.074-.466-1.54a3 3 0 0 0-2.098-1.297c-.557-.072-1.087.076-1.585.272-.49.192-1.083.489-1.793.844l-.042.02c-.56.28-.675.328-.777.348a1 1 0 0 1-.384 0c-.102-.02-.216-.067-.777-.348l-3.242-1.62c-.436-.22-.819-.411-1.236-.49Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M7.01 12H7m4.02 0h-.01m3.49-1.5L16 12m0 0 1.5 1.5M16 12l1.5-1.5M16 12l-1.5 1.5"
			/>
		</svg>
	)
}

export default IconMapTreasureDuoSolid
