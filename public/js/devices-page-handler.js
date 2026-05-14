
// Devices page filter handler
// Works with Swup page transitions

(function () {
	let devicesData = null;
	let i18nData = null;

	function createDeviceCard(device, index, viewDetailsText) {
		// Create device card HTML dynamically
		return `&lt;a
			href="${device.link}"
			target="_blank"
			rel="noopener noreferrer"
			class="device-card group relative overflow-hidden rounded-xl border border-[var(--line-divider)] bg-[var(--card-bg)] transition-all duration-300 hover:border-[var(--primary)]/50 hover:shadow-md hover:shadow-black/5 dark:hover:shadow-white/5 hover:scale-[1.02] hover:-translate-y-0.5 block cursor-pointer"
			style="animation-delay: ${index * 100}ms"
		&gt;
			&lt;div class="relative p-6 pb-0"&gt;
				&lt;div class="flex justify-center items-center h-48 bg-gradient-to-br from-[var(--card-bg)] to-[var(--btn-regular-bg)] rounded-lg overflow-hidden relative"&gt;
					&lt;div class="absolute inset-0 bg-[var(--primary)]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"&gt;&lt;/div&gt;
					&lt;img
						src="${device.image}"
						alt="${device.name}"
						class="w-auto h-full max-h-full object-contain group-hover:scale-110 transition-all duration-500 drop-shadow-md relative z-10"
						loading="lazy"
					/&gt;
				&lt;/div&gt;
			&lt;/div&gt;
			&lt;div class="p-6 pt-4 relative z-10"&gt;
				&lt;div class="flex items-start justify-between mb-3"&gt;
					&lt;h3 class="text-lg font-bold text-black/90 dark:text-white/90 group-hover:text-[var(--primary)] transition-colors duration-300"&gt;
						${device.name}
					&lt;/h3&gt;
					&lt;div class="p-1.5 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] opacity-0 group-hover:opacity-100 transition-opacity duration-300"&gt;
						&lt;svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"&gt;
							&lt;path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"&gt;&lt;/path&gt;
						&lt;/svg&gt;
					&lt;/div&gt;
				&lt;/div&gt;
				&lt;div class="mb-4"&gt;
					&lt;div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--btn-regular-bg)] text-black/70 dark:text-white/70 text-sm mb-3"&gt;
						&lt;svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"&gt;
							&lt;path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"&gt;&lt;/path&gt;
							&lt;path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"&gt;&lt;/path&gt;
						&lt;/svg&gt;
						&lt;span class="font-medium"&gt;${device.specs}&lt;/span&gt;
					&lt;/div&gt;
					&lt;p class="text-sm text-black/60 dark:text-white/60 leading-relaxed line-clamp-2"&gt;
						${device.description}
					&lt;/p&gt;
				&lt;/div&gt;
				&lt;div class="flex items-center justify-between pt-3 border-t border-[var(--line-divider)] border-dashed opacity-0 group-hover:opacity-100 transition-all duration-300"&gt;
					&lt;span class="text-sm font-medium text-[var(--primary)]"&gt;${viewDetailsText}&lt;/span&gt;
					&lt;svg class="w-5 h-5 text-[var(--primary)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"&gt;
						&lt;path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"&gt;&lt;/path&gt;
					&lt;/svg&gt;
				&lt;/div&gt;
			&lt;/div&gt;
		&lt;/a&gt;`;
	}

	function renderDevices(brand) {
		const container = document.getElementById("devices-container");
		if (!container || !devicesData || !i18nData) return;

		const devices = devicesData[brand];
		if (!devices) {
			container.innerHTML = "";
			return;
		}

		container.innerHTML = devices
			.map((device, index) =&gt; createDeviceCard(device, index, i18nData.viewDetails))
			.join("");
	}

	function initDevicesPage() {
		const dataScript = document.getElementById("devices-data");
		const i18nScript = document.getElementById("i18n-data");

		if (!dataScript || !i18nScript) return;

		try {
			devicesData = JSON.parse(dataScript.textContent);
			i18nData = JSON.parse(i18nScript.textContent);
		} catch (e) {
			console.error("Failed to parse devices data:", e);
			return;
		}

		const filterTags = document.querySelectorAll(".filter-tag");

		filterTags.forEach((tag) =&gt; {
			tag.addEventListener("click", () =&gt; {
				filterTags.forEach((t) =&gt; t.classList.remove("active"));
				tag.classList.add("active");

				const brand = tag.dataset.brand;
				renderDevices(brand);
			});
		});
	}

	function onInit() {
		if (document.getElementById("devices-container")) {
			initDevicesPage();
		}
	}

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", onInit);
	} else {
		onInit();
	}

	document.addEventListener("astro:page-load", onInit);
})();
