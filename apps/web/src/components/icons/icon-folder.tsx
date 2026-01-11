import type { SVGProps } from "react"

type IconProps = SVGProps<SVGSVGElement> & {
	secondaryfill?: string
	title?: string
}

export function IconFolder({ fill = "currentColor", secondaryfill, title = "folder", ...props }: IconProps) {
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
					d="M1.5 6.5H16.5V13.25C16.5 14.7692 15.2692 16 13.75 16H4.25C2.73079 16 1.5 14.7692 1.5 13.25V6.5Z"
					fill={secondaryfill}
					opacity="0.4"
				/>
				<path
					d="M4.25 2C2.73079 2 1.5 3.23079 1.5 4.75V6.5H16.5V6.25C16.5 4.73079 15.2692 3.5 13.75 3.5H8.72395L8.34569 3.02827C7.82347 2.37825 7.03552 2 6.201 2H4.25Z"
					fill={fill}
				/>
			</g>
		</svg>
	)
}

// Alias for backwards compatibility
export { IconFolder as IconFolders }

export default IconFolder
