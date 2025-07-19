// duo-solid/food
import type { Component, JSX } from "solid-js"

export const IconBottleMilkDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M8 2h8M9 2v2.789a4 4 0 0 1-.672 2.219l-.656.984A4 4 0 0 0 7 10.212V20a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-9.789a4 4 0 0 0-.672-2.219l-.656-.984A4 4 0 0 1 15 4.788V2"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M8 2h8"
			/>
			<path
				fill="currentColor"
				d="M9.871 13.506a7.5 7.5 0 0 1 2.516.571c.669.28 1.387.425 2.113.425l.271-.007a5.5 5.5 0 0 0 1.842-.418l.118-.04A1 1 0 0 1 18 15v5a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3v-5l.01-.15a1 1 0 0 1 .603-.773l.346-.135a7.5 7.5 0 0 1 2.541-.445z"
			/>
		</svg>
	)
}

export default IconBottleMilkDuoSolid
