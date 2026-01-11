import type { SVGProps } from "react"

type IconProps = SVGProps<SVGSVGElement> & {
	secondaryfill?: string
	title?: string
}

export function IconBellSlash({
	fill = "currentColor",
	secondaryfill,
	title = "bell-slash",
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
					d="M10.2 15H7.80099C7.64999 15 7.50799 15.068 7.41299 15.185C7.31799 15.302 7.28099 15.456 7.31199 15.603C7.48499 16.425 8.17999 17 9.00099 17C9.82199 17 10.517 16.425 10.69 15.603C10.721 15.456 10.684 15.302 10.589 15.185C10.494 15.068 10.351 15 10.2 15Z"
					fill={fill}
				/>
				<path
					d="M13.9335 4.06644C13.0355 2.24966 11.1635 1 9 1C5.96279 1 3.5 3.46279 3.5 6.5V10.75C3.5 11.4408 2.94079 12 2.25 12C1.83579 12 1.5 12.3358 1.5 12.75C1.5 13.1642 1.83579 13.5 2.25 13.5H4.49999L13.9335 4.06644Z"
					fill={secondaryfill}
					opacity="0.4"
				/>
				<path
					d="M14.5 6.68198L7.68198 13.5H15.75C16.1642 13.5 16.5 13.1642 16.5 12.75C16.5 12.3358 16.1642 12 15.75 12C15.0592 12 14.5 11.4408 14.5 10.75V6.68198Z"
					fill={secondaryfill}
					opacity="0.4"
				/>
				<path
					fillRule="evenodd"
					clipRule="evenodd"
					d="M16.5303 1.46967C16.8232 1.76256 16.8232 2.23744 16.5303 2.53033L2.53033 16.5303C2.23744 16.8232 1.76256 16.8232 1.46967 16.5303C1.17678 16.2374 1.17678 15.7626 1.46967 15.4697L15.4697 1.46967C15.7626 1.17678 16.2374 1.17678 16.5303 1.46967Z"
					fill={fill}
				/>
			</g>
		</svg>
	)
}

export default IconBellSlash
