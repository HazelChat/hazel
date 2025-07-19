// duo-stroke/web3-&-crypto
import type { Component, JSX } from "solid-js"

export const IconNftBoltMintDuoStroke: Component<JSX.IntrinsicElements["svg"]> = (props) => {
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
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M11.531 21h-.785c-.773 0-1.33 0-1.778-.035a3.8 3.8 0 0 1-.907-.167 4 4 0 0 1-1.466-.856c-.477-.437-.812-1.036-1.482-2.234l-1.454-2.6c-.635-1.134-.952-1.702-1.076-2.302a4 4 0 0 1 0-1.612c.124-.6.441-1.168 1.076-2.302l1.454-2.6c.67-1.198 1.005-1.797 1.482-2.233a4 4 0 0 1 1.466-.857C8.676 3 9.366 3 10.746 3h2.486c1.38 0 2.07 0 2.685.202.545.179 1.044.47 1.466.857.477.436.812 1.035 1.482 2.233l1.49 2.663c.546.978.853 1.526 1.004 2.045q.032.107.054.213c.111.522.116 1.06.014 1.585-.09.458-.29.899-.657 1.597"
				opacity=".28"
			/>
			<path
				fill="currentColor"
				d="M19.791 10h-.818c-.875 0-1.382 0-1.82.038-4.86.422-8.72 4.25-9.147 9.09-.015.17-.024.35-.03.559q.192.093.396.161c.173.057.375.096.675.12.25.02.545.027.924.03.004-.305.011-.51.028-.695.34-3.862 3.425-6.933 7.328-7.273.34-.03.754-.03 1.71-.03h1.462a3 3 0 0 0-.1-.72c-.089-.305-.256-.64-.608-1.28Z"
			/>
			<path
				fill="currentColor"
				fill-rule="evenodd"
				d="M6.96 9c0-1.111.906-2 2.008-2s2.007.889 2.007 2-.905 2-2.007 2A2.003 2.003 0 0 1 6.96 9Z"
				clip-rule="evenodd"
			/>
			<path
				fill="currentColor"
				fill-rule="evenodd"
				d="M17.524 14.897a1 1 0 0 1 .327 1.376l-1.062 1.726H19a1 1 0 0 1 .852 1.524l-2 3.25a1 1 0 0 1-1.703-1.048l1.062-1.726H15a1 1 0 0 1-.852-1.524l2-3.25a1 1 0 0 1 1.376-.328Z"
				clip-rule="evenodd"
			/>
		</svg>
	)
}

export default IconNftBoltMintDuoStroke
