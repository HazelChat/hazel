// duo-stroke/building
import type { Component, JSX } from "solid-js"

export const IconDoorOpenDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				d="M19 19a1 1 0 1 0 0 2zm3 2a1 1 0 1 0 0-2zM5.272 5.345l.891.454v0zm1.093-1.092-.454-.891h0zM11 4.98a1 1 0 1 0 0-2zM2 19a1 1 0 1 0 0 2zm9 2a1 1 0 1 0 0-2zm8-1v1h3v-2h-3zM5 7.98h1c0-.716 0-1.193.03-1.56.03-.355.081-.518.133-.62l-.89-.455-.892-.453c-.22.431-.305.886-.344 1.365C4 6.724 4 7.297 4 7.98zm4-4v-1c-.684 0-1.256 0-1.723.038-.48.039-.934.124-1.366.344l.454.891.454.891c.103-.052.265-.104.62-.133.367-.03.844-.03 1.561-.03zM5.272 5.345l.891.454a1.5 1.5 0 0 1 .656-.655l-.454-.891-.454-.891a3.5 3.5 0 0 0-1.53 1.53zM9 3.98v1h2v-2H9zm-4 4H4V20h2V7.98zM2 20v1h3v-2H2zm3 0v1h6v-2H5z"
				opacity=".28"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M11 20.714V3.309c0-.776 0-1.164.163-1.413a1 1 0 0 1 .619-.429c.29-.065.653.071 1.38.344l3.242 1.216c.936.35 1.404.526 1.749.83.305.268.54.607.684.986.163.43.163.93.163 1.93v10.511c0 1.009 0 1.513-.166 1.946a2.5 2.5 0 0 1-.693.99c-.35.304-.823.477-1.77.822l-3.223 1.175c-.723.263-1.084.395-1.373.329a1 1 0 0 1-.614-.43C11 21.867 11 21.483 11 20.714Z"
			/>
			<path
				stroke="currentColor"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M14.947 11.618h-.918"
			/>
		</svg>
	)
}

export default IconDoorOpenDuoStroke
