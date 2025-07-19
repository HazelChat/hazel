// duo-stroke/money-&-payments
import type { Component, JSX } from "solid-js"

export const IconCreditCardLockedDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M22 9h-.006m0 0c.006.413.006 1.925.006 2.45M21.994 9c-.018-1.35-.096-2.16-.43-2.816a4 4 0 0 0-1.748-1.748C18.96 4 17.84 4 15.6 4H8.4c-2.24 0-3.36 0-4.216.436a4 4 0 0 0-1.748 1.748c-.334.655-.412 1.466-.43 2.816m0 0H2m.006 0C2 9.413 2 9.876 2 10.4v3.2c0 2.24 0 3.36.436 4.216a4 4 0 0 0 1.748 1.748C5.04 20 6.16 20 8.4 20h1.671"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M21.995 9H2.005m18.787 8.11v-.443C20.792 15.194 19.542 14 18 14s-2.791 1.194-2.791 2.667v.442m5.583 0-.072-.023C20.442 17 20.09 17 19.385 17h-2.77c-.704 0-1.056 0-1.334.086l-.072.023m5.583 0c.591.208 1.034.8 1.173 1.39.064.273.032.608-.031 1.278-.055.569-.082.853-.175 1.085-.21.52-.665.917-1.226 1.07-.25.068-.55.068-1.148.068h-2.77c-.598 0-.897 0-1.147-.068a1.83 1.83 0 0 1-1.226-1.07c-.094-.232-.121-.516-.175-1.085-.064-.67-.096-1.005-.032-1.278.139-.59.582-1.182 1.174-1.39M9 13H6"
				fill="none"
			/>
		</svg>
	)
}

export default IconCreditCardLockedDuoStroke
