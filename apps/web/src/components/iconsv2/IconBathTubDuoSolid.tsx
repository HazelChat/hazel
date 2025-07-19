// duo-solid/building
import type { Component, JSX } from "solid-js"

export const IconBathTubDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.width || "24"}
			height={props.height || "24"}
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<g opacity=".28">
				<path
					fill="currentColor"
					d="M16.293 19.293a1 1 0 0 1 1.338-.068l.076.067 1 1.001a1 1 0 1 1-1.414 1.414l-1-1a1 1 0 0 1 0-1.414Z"
				/>
				<path
					fill="currentColor"
					d="M6.37 19.225a1 1 0 0 1 1.407 1.406l-.07.076-1 1a1 1 0 0 1-1.414-1.414l1-1z"
				/>
				<path
					fill="currentColor"
					d="M6 1a4 4 0 0 1 4 4v1a1 1 0 0 1-2 0V5a2 2 0 1 0-4 0v6a1 1 0 0 1-2 0V5a4 4 0 0 1 4-4Z"
				/>
			</g>
			<path
				fill="currentColor"
				d="M22 10a1 1 0 0 1 .707 1.707c-.142.142-.23.23-.29.294l-.118.137c-.113.15-.196.32-.245.5l-.038.183c-.013.09-.016.193-.016.593V15.2c0 .824.001 1.502-.044 2.052-.04.492-.12.95-.306 1.38l-.085.184a4 4 0 0 1-1.473 1.594l-.276.154c-.485.248-1.002.346-1.564.392-.55.045-1.228.044-2.052.044H7.8c-.824 0-1.502.001-2.052-.044-.492-.04-.95-.12-1.38-.306l-.184-.085a4 4 0 0 1-1.594-1.473l-.154-.276c-.248-.485-.346-1.002-.392-1.564C1.999 16.702 2 16.024 2 15.2v-1.786c0-.2 0-.326-.003-.413l-.013-.18a1.5 1.5 0 0 0-.18-.527l-.103-.156A2 2 0 0 0 1.583 12l-.29-.294A1 1 0 0 1 2 10z"
			/>
			<path fill="currentColor" d="M11 5a1 1 0 0 1 0 2H7a1 1 0 0 1 0-2z" />
		</svg>
	)
}

export default IconBathTubDuoSolid
