// contrast/media
import type { Component, JSX } from "solid-js"

export const IconFilm1: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M3 11c0-2.8 0-4.2.545-5.27A5 5 0 0 1 5.73 3.545C6.8 3 8.2 3 11 3h2c2.8 0 4.2 0 5.27.545a5 5 0 0 1 2.185 2.185C21 6.8 21 8.2 21 11v2c0 2.8 0 4.2-.545 5.27a5 5 0 0 1-2.185 2.185C17.2 21 15.8 21 13 21h-2c-2.8 0-4.2 0-5.27-.545a5 5 0 0 1-2.185-2.185C3 17.2 3 15.8 3 13z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M21 12v-1c0-1.246 0-2.214-.048-3M21 12v1c0 1.246 0 2.214-.048 3M21 12h-5M3 12v1c0 1.246 0 2.214.048 3M3 12v-1c0-1.246 0-2.214.048-3M3 12h5m0 8.952C8.786 21 9.754 21 11 21h2c1.246 0 2.214 0 3-.048m-8 0c-.98-.06-1.676-.194-2.27-.497a5 5 0 0 1-2.185-2.185c-.303-.594-.437-1.29-.497-2.27M8 20.952V16m-4.952 0H8m12.952 0c-.06.98-.194 1.676-.497 2.27a5 5 0 0 1-2.185 2.185c-.594.303-1.29.437-2.27.497M20.952 16H16m0 4.952V16m0-12.952C15.214 3 14.246 3 13 3h-2c-1.246 0-2.214 0-3 .048m8 0c.98.06 1.676.194 2.27.497a5 5 0 0 1 2.185 2.185c.303.594.437 1.29.497 2.27M16 3.048V8m4.952 0H16M8 3.048c-.98.06-1.676.194-2.27.497A5 5 0 0 0 3.545 5.73c-.303.594-.437 1.29-.497 2.27M8 3.048V8M3.048 8H8m0 0v4m0 0v4m0-4h8m0-4v4m0 0v4"
			/>
		</svg>
	)
}

export default IconFilm1
