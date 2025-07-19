// contrast/building
import type { Component, JSX } from "solid-js"

export const IconBeachUmbrella1: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M4.9 7.4c2.411-4.178 7.704-5.637 11.822-3.26 4.117 2.378 5.5 7.69 3.088 11.868q-.22.383-.473.735l-.266-.303a6.8 6.8 0 0 0-3.79-2.188l-.395-.079-1.292-1.26a6.8 6.8 0 0 0-2.906-1.678l-1.737-.488-.266-.304a6.8 6.8 0 0 0-3.79-2.187L4.5 8.177q.178-.394.4-.778Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M3 21h18"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M16.722 4.14C12.604 1.763 7.312 3.222 4.9 7.4q-.222.382-.4.777l.396.078c1.47.292 2.8 1.06 3.789 2.188l.266.304m7.77-6.607c4.118 2.377 5.501 7.69 3.09 11.868q-.222.382-.474.735l-.266-.304a6.8 6.8 0 0 0-3.79-2.187l-.395-.079M16.722 4.14c-1.647-.95-4.938 1.665-7.35 5.842q-.22.383-.421.765m7.77-6.607c1.648.951 1.028 5.108-1.384 9.285q-.221.383-.451.748M8.95 10.747l1.737.488a6.8 6.8 0 0 1 2.906 1.678l1.292 1.26m-2.745-2.1L7 20.98"
			/>
		</svg>
	)
}

export default IconBeachUmbrella1
