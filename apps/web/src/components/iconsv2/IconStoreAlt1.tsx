// contrast/building
import type { Component, JSX } from "solid-js"

export const IconStoreAlt1: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M21.432 7.322c.117 1.172.338 2.343.338 3.523a3.256 3.256 0 1 1-6.512 0 3.256 3.256 0 1 1-6.512 0 3.256 3.256 0 1 1-6.512 0c0-1.18.217-2.351.334-3.523.124-1.243.135-2.629 1.117-3.53C4.682 2.873 6.077 3 7.344 3h9.312c1.268 0 2.662-.126 3.66.791.98.902.992 2.288 1.116 3.531Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M20 21v-7.258m0 0a3.15 3.15 0 0 1-1.488.36 3.256 3.256 0 0 1-3.255-3.255A3.25 3.25 0 0 1 14 13.417m6 .325c1.145-.605 1.82-1.896 1.75-3.275l-.315-3.145C21.118 4.15 20.03 3 16.659 3h-9.32C3.97 3 2.882 4.15 2.565 7.322l-.315 3.145c-.061 1.379.608 2.67 1.751 3.275m0 0c.433.23.934.36 1.489.36a3.256 3.256 0 0 0 3.256-3.255A3.256 3.256 0 0 0 14 13.417m-10 .325V18.6c0 .84 0 1.26.163 1.581a1.5 1.5 0 0 0 .656.656c.32.163.74.163 1.581.163h5.2c.84 0 1.26 0 1.581-.163a1.5 1.5 0 0 0 .656-.656c.163-.32.163-.74.163-1.581v-5.183"
			/>
		</svg>
	)
}

export default IconStoreAlt1
