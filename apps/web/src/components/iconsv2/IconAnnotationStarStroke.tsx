// stroke/communication
import type { Component, JSX } from "solid-js"

export const IconAnnotationStarStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M2.5 9.08c0-2.129 0-3.193.414-4.005a3.8 3.8 0 0 1 1.66-1.66C5.388 3 6.452 3 8.58 3h6.839c2.128 0 3.192 0 4.005.414a3.8 3.8 0 0 1 1.66 1.66c.415.813.415 1.877.415 4.006v4.56c0 .705 0 1.058-.047 1.353a3.8 3.8 0 0 1-3.159 3.16c-.57.09-1.149 0-1.72.054a1.9 1.9 0 0 0-1.232.616c-.334.37-.611.802-.91 1.2-.825 1.1-1.237 1.651-1.743 1.848a1.9 1.9 0 0 1-1.378 0c-.505-.197-.918-.747-1.743-1.848-.298-.398-.575-.83-.91-1.2a1.9 1.9 0 0 0-1.232-.616c-.57-.053-1.15.035-1.72-.055a3.8 3.8 0 0 1-3.158-3.159c-.047-.295-.047-.648-.047-1.354z"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M11.992 8a3 3 0 0 0 2.805 2.992l.195.008c-.101.004-.152.005-.195.008A3 3 0 0 0 12 13.805l-.008.195-.009-.195a3 3 0 0 0-2.796-2.797L8.992 11c.1-.004.151-.005.195-.008a3 3 0 0 0 2.796-2.797z"
				fill="none"
			/>
		</svg>
	)
}

export default IconAnnotationStarStroke
