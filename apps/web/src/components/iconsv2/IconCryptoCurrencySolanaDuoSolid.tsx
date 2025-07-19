// duo-solid/web3-&-crypto
import type { Component, JSX } from "solid-js"

export const IconCryptoCurrencySolanaDuoSolid: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				fill-rule="evenodd"
				d="M8.399 3h9.978c.456 0 .866 0 1.19.03.31.029.769.098 1.14.417.446.384.683.952.656 1.531-.022.477-.27.858-.459 1.112-.195.264-.471.575-.78.924l-1.17 1.32H2.227a2.7 2.7 0 0 1 .276-.437c.147-.195.339-.411.546-.644l2.71-3.056c.246-.278.477-.54.764-.734.252-.17.532-.298.827-.376C7.687 3 8.035 3 8.399 3Zm13.375 12.667H5.047l-1.17 1.319c-.31.349-.585.66-.781.924-.188.254-.437.635-.459 1.112a1.9 1.9 0 0 0 .656 1.53c.372.32.83.39 1.14.418.324.03.734.03 1.19.03h9.978c.364 0 .713.001 1.05-.087.295-.078.574-.205.826-.376.287-.194.518-.456.765-.734l2.71-3.056c.206-.233.398-.45.545-.644.1-.13.196-.274.277-.436Z"
				clip-rule="evenodd"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				d="M2.503 10.77a3 3 0 0 1-.276-.437h16.727l1.999 2.255c.206.232.397.448.544.642.1.13.196.274.277.437H5.047L3.07 11.438l-.021-.024c-.207-.233-.399-.45-.546-.644Z"
			/>
		</svg>
	)
}

export default IconCryptoCurrencySolanaDuoSolid
