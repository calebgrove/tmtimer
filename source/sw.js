self.addEventListener('install', function(e) {
	e.waitUntil(
		caches.open('tmtimer').then(function(cache) {
			return cache.addAll([
				'/',
				'/index.html',
				'styles.css',
				'app.js',
				'//cdnjs.cloudflare.com/ajax/libs/gsap/latest/plugins/CSSPlugin.min.js',
				'//cdnjs.cloudflare.com/ajax/libs/gsap/latest/TweenLite.min.js',
				'favicon.ico',
			]);
		})
	);
});

self.addEventListener('fetch', function(event) {
	event.respondWith(
		caches.match(event.request).then(function(response) {
			return response || fetch(event.request);
		})
	);
});