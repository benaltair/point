<script context="module">
	export const ssr = false;
</script>

<script lang="ts">
	import { browser, dev } from '$app/env';

	let compassCircle: HTMLElement;
	let myPoint: HTMLElement;
	let compass: number;
	let supported: boolean = false;
	const isIOS =
		navigator.userAgent.match(/(iPod|iPhone|iPad)/) && navigator.userAgent.match(/AppleWebKit/);

	function init() {
		navigator.geolocation.getCurrentPosition(locationHandler);
	}

	function startCompass() {
		if (isIOS && browser) {
			DeviceOrientationEvent.requestPermission()
				.then((response) => {
					if (response === 'granted') {
						window.addEventListener('deviceorientation', handler, true);
					} else {
						alert('has to be allowed!');
					}
				})
				.catch(() => alert('not supported'));
		}
	}

	function handler(e) {
		if (!e) supported = false;
		compass = e.webkitCompassHeading || Math.abs(e.alpha - 360);
		compassCircle.style.transform = `translate(-50%, -50%) rotate(${-compass}deg)`;

		// ±15 degree
		if (
			(pointDegree < Math.abs(compass) && pointDegree + 15 > Math.abs(compass)) ||
			pointDegree > Math.abs(compass + 15) ||
			pointDegree < Math.abs(compass)
		) {
			myPoint.style.opacity = '0';
		} else if (pointDegree) {
			myPoint.style.opacity = '1';
		}
	}

	let pointDegree;

	function locationHandler(position) {
		const { latitude, longitude } = position.coords;
		pointDegree = calcDegreeToPoint(latitude, longitude);

		if (pointDegree < 0) {
			pointDegree = pointDegree + 360;
		}
	}

	function calcDegreeToPoint(latitude, longitude) {
		// Qiblih geolocation
		const point = {
			lat: 32.9430975,
			lng: 35.0934382
		};

		const phiK = (point.lat * Math.PI) / 180.0;
		const lambdaK = (point.lng * Math.PI) / 180.0;
		const phi = (latitude * Math.PI) / 180.0;
		const lambda = (longitude * Math.PI) / 180.0;
		const psi =
			(180.0 / Math.PI) *
			Math.atan2(
				Math.sin(lambdaK - lambda),
				Math.cos(phi) * Math.tan(phiK) - Math.sin(phi) * Math.cos(lambdaK - lambda)
			);
		return Math.round(psi);
	}

	init();
</script>

<svelte:window on:deviceorientationabsolute={handler} />
{#if supported || dev}
	<div class="compass">
		<div class="arrow" />
		<div class="compass-circle" bind:this={compassCircle} />
		<div class="my-point" bind:this={myPoint} />
	</div>
	{#if isIOS}
		<button class="start-btn" on:click={startCompass}>Start compass</button>
	{/if}
{:else}
	<p>Sorry, this device is not supported.</p>
{/if}

<style>
	:global(body) {
		display: flex;
		flex-direction: column;
		place-items: center;
		text-align: center;
		padding: 0.5em 1em;
		max-height: 100vh;
	}

	.compass {
		--size: min(80vh, 80vw);
		position: relative;
		width: var(--size);
		height: var(--size);
		border-radius: 50%;
		box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
		margin: auto;
	}

	.compass > .arrow {
		position: absolute;
		width: 0;
		height: 0;
		top: -20px;
		left: 50%;
		transform: translateX(-50%);
		border-style: solid;
		border-width: 30px 20px 0 20px;
		border-color: red transparent transparent transparent;
		z-index: 1;
	}

	.compass > .compass-circle,
	.compass > .my-point {
		position: absolute;
		width: 90%;
		height: 90%;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		/* transition: transform 0.1s ease-out; */
		background: url(https://purepng.com/public/uploads/large/purepng.com-compasscompassinstrumentnavigationcardinal-directionspointsdiagram-1701527842316onq7x.png)
			center no-repeat;
		background-size: contain;
	}

	.compass > .my-point {
		opacity: 0;
		width: 20%;
		height: 20%;
		background: rgb(8, 223, 69);
		border-radius: 50%;
		transition: opacity 0.5s ease-out;
	}

	.start-btn {
		margin-top: 2em;
		margin-bottom: auto;
	}
</style>
