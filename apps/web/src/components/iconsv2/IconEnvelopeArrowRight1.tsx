// contrast/communication
import type { Component, JSX } from "solid-js"

export const IconEnvelopeArrowRight1: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
					d="M14 4h-4c-2.8 0-4.2 0-5.27.545A5 5 0 0 0 2.545 6.73C2 7.8 2 9.2 2 12s0 4.2.545 5.27a5 5 0 0 0 2.185 2.185C5.8 20 7.2 20 10 20h3a3 3 0 0 1 3-2.999h.62a3 3 0 0 1 4.745-1.99h.586C22 14.225 22 13.252 22 12c0-2.8 0-4.2-.545-5.27a5 5 0 0 0-2.185-2.185C18.2 4 16.8 4 14 4Z"
				/>
				<path fill="currentColor" d="M21.919 15.435h-.011l.01.008z" />
			</g>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M19.59 22.573a13 13 0 0 0 2.275-2.191.6.6 0 0 0 .135-.38m-2.41-2.572c.846.634 1.61 1.37 2.275 2.191.09.111.135.246.135.38m0 0h-6M12 20h-2c-2.8 0-4.2 0-5.27-.545a5 5 0 0 1-2.185-2.185C2 16.2 2 14.8 2 12c0-1.994 0-3.278.197-4.238m19.606 0-5.508 3.505c-1.557.99-2.335 1.486-3.171 1.678a5 5 0 0 1-2.248 0c-.836-.192-1.614-.688-3.171-1.678L2.197 7.762m19.606 0C22 8.722 22 10.006 22 12c0 .862 0 1.591-.016 2.219m-.18-6.457a4 4 0 0 0-.349-1.032 5 5 0 0 0-2.185-2.185C18.2 4 16.8 4 14 4h-4c-2.8 0-4.2 0-5.27.545A5 5 0 0 0 2.545 6.73a4 4 0 0 0-.348 1.032"
			/>
		</svg>
	)
}

export default IconEnvelopeArrowRight1
