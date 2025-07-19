// duo-stroke/communication
import type { Component, JSX } from "solid-js"

export const IconInboxOutgoingDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M21.928 11a2 2 0 0 0-.059-.18c-.055-.146-.134-.283-.29-.558l-1.736-3.037c-.671-1.175-1.007-1.762-1.479-2.19a4 4 0 0 0-1.444-.837M2.072 11q.025-.09.059-.18c.055-.146.134-.283.29-.558l1.736-3.037c.671-1.175 1.007-1.762 1.478-2.19a4 4 0 0 1 1.445-.837"
				opacity=".28"
				fill="none"
			/>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M14 5.874a10 10 0 0 0-1.704-1.77A.47.47 0 0 0 12 4m-2 1.874a10 10 0 0 1 1.704-1.77A.47.47 0 0 1 12 4m0 0v5m2 11h-4c-2.8 0-4.2 0-5.27-.545a5 5 0 0 1-2.185-2.185C2 16.2 2 14.8 2 12v-.15c0-.317 0-.475.024-.63a2 2 0 0 1 .048-.22h5.005c.51 0 .923.413.923.923C8 13.623 9.378 15 11.077 15h1.846c1.7 0 3.077-1.378 3.077-3.077 0-.51.413-.923.923-.923h5.005a2 2 0 0 1 .048.22c.024.155.024.313.024.63V12c0 2.8 0 4.2-.545 5.27a5 5 0 0 1-2.185 2.185C18.2 20 16.8 20 14 20Z"
				fill="none"
			/>
		</svg>
	)
}

export default IconInboxOutgoingDuoStroke
