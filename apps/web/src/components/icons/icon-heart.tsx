import type { SVGProps } from "react"

type IconProps = SVGProps<SVGSVGElement> & {
	secondaryfill?: string
	title?: string
}

export function IconHeart({ fill = "currentColor", secondaryfill, title = "heart", ...props }: IconProps) {
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
					d="M8.999 16.0874C8.7187 16.0874 8.43849 16.0205 8.18259 15.8872C6.55659 15.0381 1.25101 11.8603 1.25101 6.6089C1.24121 4.0845 3.292 2.0156 5.8223 2C7.0284 2.0151 8.1592 2.4902 9 3.3057C9.8398 2.4903 10.9678 2.0152 12.1631 2C14.708 2.0156 16.7588 4.0845 16.749 6.6118C16.749 11.8618 11.4433 15.0386 9.81641 15.8872C9.56051 16.0205 9.2803 16.0874 8.999 16.0874Z"
					fill={secondaryfill}
					opacity="0.4"
				/>
			</g>
		</svg>
	)
}

export default IconHeart
