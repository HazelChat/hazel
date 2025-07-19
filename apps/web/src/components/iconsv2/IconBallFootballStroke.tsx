// stroke/sports
import type { Component, JSX } from "solid-js"

export const IconBallFootballStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="m13.5 10.5-3 3m10.246-1.668A21.3 21.3 0 0 0 21.231 8c.063-1.56-.234-2.77-1.348-3.883C18.77 3.003 17.56 2.706 16 2.769c-1.2.048-2.516.187-3.832.486m8.578 8.577c-.485 2.14-1.391 4.276-3.013 5.898s-3.757 2.527-5.897 3.012m8.91-8.91a41.4 41.4 0 0 0-8.578-8.577m0 0c-2.14.484-4.276 1.39-5.898 3.012-1.621 1.621-2.527 3.757-3.012 5.896m0 0a21.4 21.4 0 0 0-.485 3.833c-.063 1.56.234 2.77 1.348 3.883 1.113 1.114 2.323 1.411 3.883 1.348 1.2-.048 2.517-.187 3.832-.485m-8.578-8.579a41.4 41.4 0 0 0 8.578 8.579"
				fill="none"
			/>
		</svg>
	)
}

export default IconBallFootballStroke
