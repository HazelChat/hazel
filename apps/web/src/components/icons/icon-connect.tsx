import type { SVGProps } from "react"

type IconProps = SVGProps<SVGSVGElement> & {
	secondaryfill?: string
	title?: string
}

export function IconConnect({
	fill = "currentColor",
	secondaryfill,
	title = "connect",
	...props
}: IconProps) {
	secondaryfill = secondaryfill || fill

	return (
		<svg
			height="18"
			width="18"
			data-slot="icon"
			viewBox="0 0 18 18"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<title>{title}</title>
			<g fill={fill}>
				<path
					d="M7.75 10.25L10.25 7.75"
					fill="none"
					stroke={fill}
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth="1.5"
				/>
				<path
					d="M11.773 11.773L13.182 10.364C14.353 9.193 14.353 7.318 13.182 6.146L11.854 4.818C10.683 3.647 8.808 3.647 7.636 4.818L6.227 6.227"
					fill="none"
					stroke={fill}
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth="1.5"
				/>
				<path
					d="M6.227 6.227L4.818 7.636C3.647 8.808 3.647 10.683 4.818 11.854L6.146 13.182C7.318 14.353 9.193 14.353 10.364 13.182L11.773 11.773"
					fill="none"
					stroke={secondaryfill}
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth="1.5"
					opacity="0.4"
				/>
			</g>
		</svg>
	)
}

export default IconConnect
