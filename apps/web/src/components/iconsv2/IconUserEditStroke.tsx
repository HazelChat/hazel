// stroke/users
import type { Component, JSX } from "solid-js"

export const IconUserEditStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M11.247 15H8a4 4 0 0 0-4 4 2 2 0 0 0 2 2h3m7-14a4 4 0 1 1-8 0 4 4 0 0 1 8 0Zm-3.078 14 1.206-.008c.364-.002.546-.003.717-.045q.228-.056.43-.18c.15-.092.278-.22.535-.478l5.918-5.917a.94.94 0 0 0 .122-1.18l-.02-.03a3.6 3.6 0 0 0-1.074-1.063.9.9 0 0 0-1.12.122l-5.973 5.973c-.248.248-.372.372-.462.516q-.12.193-.18.412c-.043.165-.049.34-.06.69z"
				fill="none"
			/>
		</svg>
	)
}

export default IconUserEditStroke
