// contrast/money-&-payments
import type { Component, JSX } from "solid-js"

export const IconCreditCardArrowRepeat1: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M2.436 6.184C2 7.04 2 8.16 2 10.4v3.2c0 2.24 0 3.36.436 4.216a4 4 0 0 0 1.748 1.748C5.04 20 6.16 20 8.4 20h.977q.215-.931.564-1.82c.34-.87 1-1.535 1.805-1.897a3 3 0 0 1 .993-3.095 7 7 0 0 1 2.342-1.268 6.99 6.99 0 0 1 6.042.888q.415-.177.877-.224V10.4c0-2.24 0-3.36-.436-4.216a4 4 0 0 0-1.748-1.748C18.96 4 17.84 4 15.6 4H8.4c-2.24 0-3.36 0-4.216.436a4 4 0 0 0-1.748 1.748Z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M22.295 15.57a10 10 0 0 1-.672 2.363.47.47 0 0 1-.455.286m-2.403-.768c.745.349 1.53.604 2.336.76l.067.008m-5.565 1.463a10 10 0 0 0-2.4-.704m-1.079 2.677c.105-.816.31-1.615.61-2.38a.47.47 0 0 1 .469-.297m7.965-.759a4 4 0 0 0-6.524-2.714m-1.441 3.473q.04.411.167.82a4 4 0 0 0 6.366 1.88M2 9h.006m0 0h19.988M2.006 9C2 9.413 2 9.876 2 10.4v3.2c0 2.24 0 3.36.436 4.216a4 4 0 0 0 1.748 1.748c.853.435 1.969.436 4.195.436M2.006 9c.018-1.35.096-2.16.43-2.816a4 4 0 0 1 1.748-1.748C5.04 4 6.16 4 8.4 4h7.2c2.24 0 3.36 0 4.216.436a4 4 0 0 1 1.748 1.748c.334.655.412 1.466.43 2.816m0 0H22m-.006 0c.006.413.006.876.006 1.4v1.184M6 13h3"
			/>
		</svg>
	)
}

export default IconCreditCardArrowRepeat1
