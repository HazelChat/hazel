// duo-solid/ai
import type { Component, JSX } from "solid-js"

export const IconEnvelopeAiDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<g fill="currentColor" opacity=".28">
				<path
					fill="currentColor"
					d="M14.044 3c1.363 0 2.447 0 3.321.071.896.074 1.66.227 2.359.583a6 6 0 0 1 2.604 2.588l-6.57 4.181c-1.62 1.03-2.23 1.403-2.859 1.548a4 4 0 0 1-1.798 0c-.63-.145-1.24-.517-2.86-1.548l-6.57-4.181a6 6 0 0 1 2.605-2.588c.7-.356 1.463-.51 2.359-.583C7.509 3 8.593 3 9.956 3z"
				/>
				<path
					fill="currentColor"
					d="M1.109 8.255c-.11.95-.11 2.123-.109 3.617v.172c0 1.363 0 2.447.071 3.321.074.896.227 1.66.583 2.359a6 6 0 0 0 2.622 2.622c.7.356 1.463.51 2.359.583C7.509 21 8.593 21 9.956 21h2.215a3 3 0 0 1 1.214-1.529A3 3 0 0 1 14.9 15.21c.62-.244.793-.4.856-.462.064-.064.213-.236.454-.848a3 3 0 0 1 5.582 0c.241.612.39.784.454.848.057.057.206.191.7.399.055-.835.055-1.851.055-3.102v-.172c0-1.494 0-2.667-.109-3.617l-6.219 3.957c-1.402.893-2.317 1.476-3.324 1.708a6 6 0 0 1-2.697 0c-1.006-.232-1.921-.815-3.323-1.708z"
				/>
			</g>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M15 22zm4-7c-.637 1.616-1.34 2.345-3 3 1.66.655 2.363 1.384 3 3 .637-1.616 1.34-2.345 3-3-1.66-.655-2.363-1.384-3-3Z"
			/>
		</svg>
	)
}

export default IconEnvelopeAiDuoSolid
