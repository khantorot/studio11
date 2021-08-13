






function contentAnimation(data) {
	let page = data.next.namespace;

	if (page == 'index') {
		showIndex();
	} else if (page == 'movie') {
		showMovie();
	}
}

function pageTransition(data) {
	let page = data.current.namespace;
	let link = data.trigger.dataset.barbaTrigger;

	if (data.trigger != 'back' && data.trigger != 'popstate' && data.trigger != 'forward') {
		localStorage.setItem('link', data.trigger.dataset.barbaTrigger);
	}
}



function delay(n) {
	n = n || 1000;
	return new Promise(done => {
		setTimeout(() => {
			done();
		}, n)
	});
}



barba.init({

	transitions: [{
		name: 'default-transition',
		async leave(data) {
			const done = this.async();
			pageTransition(data);
			await delay(1000);
			done();
		},
		async enter(data) {
			contentAnimation(data);
		},
		async once(data) {
			contentAnimation(data);
		}
	}]
});


barba.hooks.enter((data) => {
	document.documentElement.scrollTo(0, 0);
})

barba.hooks.after((data) => {
	if (data.next.namespace == 'index') {
		let link_id = localStorage.getItem('link_id');
		let link_data = JSON.parse(localStorage.getItem('link_data'));
		document.documentElement.scrollTo(0, link_data[link_id]);
	}
});

barba.hooks.leave((data) => {
	if (data.current.namespace == 'movie') {
		localStorage.setItem('link_id', document.querySelector('.work_page_title').getAttribute('data-id'));
	}
})

barba.hooks.afterOnce((data) => {
	if (data.next.namespace == 'index') {
		let works = document.querySelectorAll('.work');
		let link_data = [];

		works.forEach(element => {
			let scrolled = element.getBoundingClientRect().top + window.scrollY;
			link_data.push(scrolled);
		});
		localStorage.setItem('link_data', JSON.stringify(link_data));
	}
});




function scrollTo(element, to, duration) {
	let start = element.scrollTop,
		change = to - start,
		currentTime = 0,
		increment = 20;

	let animateScroll = function () {
		currentTime += increment;
		var val = Math.easeInOutQuad(currentTime, start, change, duration);
		element.scrollTop = val;
		if (currentTime < duration) {
			setTimeout(animateScroll, increment);
		}
	};
	animateScroll();
}

Math.easeInOutQuad = function (t, b, c, d) {
	t /= d / 2;
	if (t < 1) return c / 2 * t * t + b;
	t--;
	return -c / 2 * (t * (t - 2) - 1) + b;
};




function showIndex() {

	let out = '';
	let works = document.querySelector('.works');

	for (key in projects) {
		out += '<a href="./movie.html" class="work" data-barba-trigger="' + projects[key].name + '" data-id="' + key + '">';
		out += '<div class="work_title">' + projects[key].name + '</div>';
		out += '<img src="./content/images/' + projects[key].image + '" alt="' + projects[key].name + '" class="work_img">';
		out += '</a>';
	}
	works.innerHTML = out;


	works.addEventListener('click', function (e) {
		if (e.target.classList.contains('work')) {
			let id = e.target.getAttribute('data-id');
			let link_data = JSON.parse(localStorage.getItem('link_data'));

			scrollTo(document.documentElement, link_data[id], 500);
			e.target.classList.add('picked_work');
		}
	})




	const menu_btn = document.querySelector('.menu_btn');
	const menu = document.querySelector('.menu');
	const body = document.querySelector('body');
	const close_menu_btn = document.querySelector('.close_menu_btn');

	menu_btn.addEventListener('click', showMenu);
	close_menu_btn.addEventListener('click', hideMenu);

	function showMenu() {
		menu.classList.add('menu_show');
		body.style.overflowY = 'hidden';
	}

	function hideMenu() {
		menu.classList.remove('menu_show');
		body.style.overflowY = 'scroll';
	}

	menu.addEventListener('click', function (e) {
		if (e.target.classList.contains('menu_link')) {
			let link_data = JSON.parse(localStorage.getItem('link_data'));

			if (e.target.classList.contains('intro_link')) {
				scrollTo(document.documentElement, 0, 500);
			} else if (e.target.classList.contains('movies_link')) {
				scrollTo(document.documentElement, link_data[0], 500);
			} else if (e.target.classList.contains('director_link')) {
				scrollTo(document.documentElement, link_data[link_data.length - 1] + link_data[0], 500);
			} else if (e.target.classList.contains('contact_link')) {
				scrollTo(document.documentElement, link_data[link_data.length - 1] + link_data[0], 500);
			}
			hideMenu();
		}
	})

}



function showMovie() {
	const back_btn = document.querySelector('.back_btn');
	const section_movie = document.querySelector('.section_movie');

	section_movie.addEventListener('click', hideMovie);
	back_btn.addEventListener('click', hideMovie);

	function hideMovie() {
		back_btn.style.pointerEvents = 'none';
		scrollTo(document.documentElement, 0, 500);
		setTimeout(function () {
			document.querySelector('.container').classList.add('hide_page');
		}, 500);
	}


	let out = '';
	let out_next = '';
	let name = localStorage.getItem('link');
	let work_page = document.querySelector('.work_page');
	let next_page = document.querySelector('.next_page');

	if (name == null) {
		out += 'error';
	}

	for (key in projects) {
		if (name == projects[key].name) {
			let last = Number(Object.keys(projects).length - 1);
			let next = (+key == last) ? 0 : +key + 1;

			out += '<div class="work_page_title" data-id="' + key + '">' + projects[key].name + '</div>';
			out += '<img src="./content/images/' + projects[key].image + '" alt="' + projects[key].name + '" class="work_page_img">';


			out_next += '<div class="work">';
			out_next += '<div class="work_title">' + projects[next].name + '</div>';
			out_next += '<img src="./content/images/' + projects[next].image + '" alt="' + projects[next].name + '" class="work_img">';
			out_next += '</div>';

			if (key == last) {
				section_movie.style.display = 'flex';
				next_page.style.display = 'none';
			}
		}
	}
	work_page.innerHTML = out;
	next_page.innerHTML = out_next;

	next_page.addEventListener('click', function () {
		localStorage.setItem('link', this.querySelector('.work_title').innerHTML);
		next_page.classList.add('next_page_active');
		let scrolled = next_page.getBoundingClientRect().top + window.scrollY;
		scrollTo(document.documentElement, scrolled, 500);
		setTimeout(function () {
			showMovie();
			scrollTo(document.documentElement, 0, 0);
			next_page.classList.remove('next_page_active');
		}, 1000)
	})
}





















