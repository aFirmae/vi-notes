import { gsap } from "gsap";
import { useEffect, useRef } from "react";
import AstronautSVG from "../assets/Astronaut";

interface NotFoundProps {
	onGoHome?: () => void;
	homeHref?: string;
}

export default function NotFound({ onGoHome, homeHref = "/dashboard" }: NotFoundProps) {
	const svgRef = useRef<SVGSVGElement>(null);

	useEffect(() => {
		const ctx = gsap.context(() => {
			const svg = svgRef.current;
			if (!svg) return;

			gsap.set(svg, { visibility: "visible" });

			gsap.to("#headStripe", {
				y: 0.5,
				rotation: 1,
				yoyo: true,
				repeat: -1,
				ease: "sine.inOut",
				duration: 1,
			});

			gsap.to("#spaceman", {
				y: 0.5,
				rotation: 1,
				yoyo: true,
				repeat: -1,
				ease: "sine.inOut",
				duration: 1,
			});

			gsap.to("#craterSmall", {
				x: -3,
				yoyo: true,
				repeat: -1,
				duration: 1,
				ease: "sine.inOut",
			});

			gsap.to("#craterBig", {
				x: 3,
				yoyo: true,
				repeat: -1,
				duration: 1,
				ease: "sine.inOut",
			});

			gsap.to("#planet", {
				rotation: -2,
				yoyo: true,
				repeat: -1,
				duration: 1,
				ease: "sine.inOut",
				transformOrigin: "50% 50%",
			});

			gsap.to("#starsBig g", {
				rotation: "random(-30,30)",
				transformOrigin: "50% 50%",
				yoyo: true,
				repeat: -1,
				ease: "sine.inOut",
			});

			gsap.fromTo(
				"#starsSmall g",
				{ scale: 0, transformOrigin: "50% 50%" },
				{
					scale: 1,
					transformOrigin: "50% 50%",
					yoyo: true,
					repeat: -1,
					stagger: 0.1,
				}
			);

			gsap.to("#circlesSmall circle", {
				y: -4,
				yoyo: true,
				duration: 1,
				ease: "sine.inOut",
				repeat: -1,
			});

			gsap.to("#circlesBig circle", {
				y: -2,
				yoyo: true,
				duration: 1,
				ease: "sine.inOut",
				repeat: -1,
			});

			gsap.set("#glassShine", { x: -68 });
			gsap.to("#glassShine", {
				x: 80,
				duration: 2,
				rotation: -30,
				ease: "expo.inOut",
				transformOrigin: "50% 50%",
				repeat: -1,
				repeatDelay: 8,
				delay: 2,
			});
		}, svgRef); // Scope selectors to the SVG ref

		return () => ctx.revert();
	}, []);

	const handleHome = (e: React.MouseEvent<HTMLAnchorElement>) => {
		if (onGoHome) {
			e.preventDefault();
			onGoHome();
		}
	};

	return (
		<div
			className="min-h-screen flex items-center justify-center font-sans px-4 sm:px-6 lg:px-8"
			style={{ fontFamily: "'Nunito Sans', sans-serif", color: "#0e0620" }}
		>
			{/* Google Font */}
			<link
				rel="stylesheet"
				href="https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@400;700;800&display=swap"
			/>

			{/* Main content */}
			<main className="w-full max-w-7xl mx-auto py-12">
				<div className="flex flex-col md:flex-row items-center justify-between gap-12">
					{/* Illustration */}
					<div className="w-full md:w-1/2 flex justify-center">
						<div className="w-full max-w-xl">
							<AstronautSVG ref={svgRef} />
						</div>
					</div>

					{/* Text */}
					<div className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left">
						<h1
							className="font-extrabold leading-none mb-6 select-none"
							style={{ fontSize: "clamp(5rem, 15vw, 8rem)", color: "#0e0620" }}
						>
							404
						</h1>
						<h2 className="text-2xl sm:text-3xl font-bold mb-4">UH OH! You're lost.</h2>
						<p className="mb-8 text-lg opacity-80 max-w-md leading-relaxed">
							The page you are looking for does not exist. How you got here is
							a mystery. But you can click the button below to go back to the
							homepage.
						</p>
						<a
							href={homeHref}
							onClick={handleHome}
							className="inline-block font-bold tracking-widest px-10 py-3 rounded-full border-2 cursor-pointer transition-all duration-300 transform hover:scale-105"
							style={{
								borderColor: "#0e0620",
								color: "#0e0620",
								background: "transparent",
								fontFamily: "'Nunito Sans', sans-serif",
							}}
							onMouseEnter={(e) => {
								e.currentTarget.style.background = "#0e0620";
								e.currentTarget.style.color = "#ffffff";
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.background = "transparent";
								e.currentTarget.style.color = "#0e0620";
							}}
						>
							GO HOME
						</a>
					</div>
				</div>
			</main>
		</div>
	);
}