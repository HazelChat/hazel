// duo-solid/weather
import type { Component, JSX } from "solid-js"

export const IconLightningThunderElectricOffDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
					d="M14.94 1.01c-.672-.075-1.291.274-1.764.583-.516.337-1.158.84-1.943 1.456L5.399 7.622c-.592.464-1.09.854-1.452 1.196-.36.34-.728.758-.867 1.307a2.63 2.63 0 0 0 .381 2.136c.328.473.828.726 1.283.904.457.18 1.056.35 1.764.552l.615.176c.41.117.656.188.836.256a1 1 0 0 1 .18.086l.005.003a.6.6 0 0 1 .161.304.4.4 0 0 1 .002.09 1 1 0 0 0 1.705.77l5.463-5.463a1 1 0 0 0 .278-.535c.037-.208.103-.477.21-.902l.453-1.799c.253-1.008.459-1.824.564-2.454.1-.588.166-1.274-.116-1.855a2.46 2.46 0 0 0-1.924-1.383Z"
				/>
				<path
					fill="currentColor"
					d="M18.254 10.718a1 1 0 0 0-.992.251L7.55 20.681a1 1 0 0 0-.11 1.284c.393.555 1 .94 1.696 1.023.667.08 1.284-.259 1.756-.56.514-.328 1.152-.819 1.932-1.418l5.73-4.403c.603-.463 1.109-.852 1.477-1.193.367-.34.741-.756.885-1.309a2.63 2.63 0 0 0-.373-2.145c-.266-.387-.643-.622-1.003-.789-.357-.166-.797-.308-1.286-.453Z"
				/>
			</g>
			<path
				fill="currentColor"
				fill-rule="evenodd"
				d="M22.707 1.293a1 1 0 0 1 0 1.414l-20 20a1 1 0 0 1-1.414-1.414l20-20a1 1 0 0 1 1.414 0Z"
				clip-rule="evenodd"
			/>
		</svg>
	)
}

export default IconLightningThunderElectricOffDuoSolid
