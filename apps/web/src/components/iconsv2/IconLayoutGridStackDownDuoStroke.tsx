// duo-stroke/general
import type { Component, JSX } from "solid-js"

export const IconLayoutGridStackDownDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<g
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				opacity=".28"
			>
				<path
					d="M5.5 10c-.465 0-.697 0-.89-.038A2 2 0 0 1 3.038 8.39C3 8.197 3 7.965 3 7.5v-2c0-.465 0-.697.038-.89A2 2 0 0 1 4.61 3.038C4.803 3 5.035 3 5.5 3s.697 0 .89.038A2 2 0 0 1 7.962 4.61C8 4.803 8 5.035 8 5.5v2c0 .465 0 .697-.038.89A2 2 0 0 1 6.39 9.962C6.197 10 5.965 10 5.5 10Z"
					fill="none"
				/>
				<path
					d="M15.2 10c-1.12 0-1.68 0-2.108-.218a2 2 0 0 1-.874-.874C12 8.48 12 7.92 12 6.8v-.6c0-1.12 0-1.68.218-2.108a2 2 0 0 1 .874-.874C13.52 3 14.08 3 15.2 3h2.6c1.12 0 1.68 0 2.108.218a2 2 0 0 1 .874.874C21 4.52 21 5.08 21 6.2v.6c0 1.12 0 1.68-.218 2.108a2 2 0 0 1-.874.874C19.48 10 18.92 10 17.8 10z"
					fill="none"
				/>
			</g>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M6.2 21c-1.12 0-1.68 0-2.108-.218a2 2 0 0 1-.874-.874C3 19.48 3 18.92 3 17.8v-.6c0-1.12 0-1.68.218-2.108a2 2 0 0 1 .874-.874C4.52 14 5.08 14 6.2 14h11.6c1.12 0 1.68 0 2.108.218a2 2 0 0 1 .874.874C21 15.52 21 16.08 21 17.2v.6c0 1.12 0 1.68-.218 2.108a2 2 0 0 1-.874.874C19.48 21 18.92 21 17.8 21z"
				fill="none"
			/>
		</svg>
	)
}

export default IconLayoutGridStackDownDuoStroke
