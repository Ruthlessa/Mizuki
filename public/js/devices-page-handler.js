document.addEventListener('DOMContentLoaded', function () {
	const filterTags = document.querySelectorAll('.filter-tag');
	const devicesContainer = document.getElementById('devices-container');
	
	if (!devicesContainer) {
		return;
	}

	// 获取设备数据
	const devicesDataScript = document.getElementById('devices-data');
	const i18nDataScript = document.getElementById('i18n-data');
	
	if (!devicesDataScript) {
		return;
	}

	let devices = {};
	try {
		devices = JSON.parse(devicesDataScript.textContent);
	} catch (e) {
		console.error('Failed to parse devices data:', e);
		return;
	}

	const i18nData = i18nDataScript ? JSON.parse(i18nDataScript.textContent) : {};
	const viewDetailsText = i18nData.viewDetails || 'View Details';

	// 存储原始设备列表的HTML
	let deviceCardsCache = {};
	const brands = Object.keys(devices);

	// 初始化缓存
	brands.forEach(brand => {
		if (devices[brand] && devices[brand].length > 0) {
			deviceCardsCache[brand] = devices[brand].map((device, index) => {
				return createDeviceCard(device, index, viewDetailsText);
			}).join('');
		}
	});

	// 创建设备卡片HTML
	function escapeHtml(value) {
		return String(value == null ? '' : value)
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#39;');
	}

	function createDeviceCard(device, index, viewDetailsText) {
		const safeImage = escapeHtml(device.image);
		const safeName = escapeHtml(device.name);
		const safeBrand = escapeHtml(device.brand || '');
		const safeViewDetailsText = escapeHtml(viewDetailsText);
		const hasImage = device.image && device.image.trim() !== '';
		const imageHtml = hasImage 
			? `<div class="relative h-48 overflow-hidden rounded-xl mb-4">
					<img src="${safeImage}" alt="${safeName}" class="w-full h-full object-cover" />
			  </div>`
			: '';
		
		const specsHtml = device.specs 
			? `<div class="space-y-2 mb-4">
					${device.specs.map(spec => `
						<div class="flex items-center justify-between text-sm">
							<span class="text-gray-500 dark:text-gray-400">${escapeHtml(spec.label)}</span>
							<span class="font-medium">${escapeHtml(spec.value)}</span>
						</div>
					`).join('')}
			  </div>`
			: '';

		return `
			<div class="device-card bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200 dark:border-gray-700" data-brand="${safeBrand}">
				${imageHtml}
				<div class="p-4">
					<h3 class="text-lg font-semibold mb-2 text-gray-900 dark:text-white">${safeName}</h3>
					${specsHtml}
					<button class="w-full py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium transition-colors">
						${safeViewDetailsText}
					</button>
				</div>
			</div>
		`;
	}

	// 切换过滤标签
	function switchFilter(tag) {
		const brand = tag.getAttribute('data-brand');
		
		// 更新标签状态
		filterTags.forEach(t => t.classList.remove('active'));
		tag.classList.add('active');

		// 更新设备列表
		if (brand && deviceCardsCache[brand]) {
			devicesContainer.innerHTML = deviceCardsCache[brand];
		} else {
			// 显示所有品牌
			let allCards = '';
			brands.forEach(b => {
				if (deviceCardsCache[b]) {
					allCards += deviceCardsCache[b];
				}
			});
			devicesContainer.innerHTML = allCards;
		}

		// 添加动画
		const cards = devicesContainer.querySelectorAll('.device-card');
		cards.forEach((card, index) => {
			card.style.opacity = '0';
			card.style.transform = 'translateY(20px)';
			setTimeout(() => {
				card.style.transition = 'all 0.5s ease';
				card.style.opacity = '1';
				card.style.transform = 'translateY(0)';
			}, index * 50);
		});
	}

	// 绑定事件
	filterTags.forEach(tag => {
		tag.addEventListener('click', function() {
			switchFilter(this);
		});
	});

	// 初始化显示第一个品牌
	if (filterTags.length > 0) {
		switchFilter(filterTags[0]);
	}
});
