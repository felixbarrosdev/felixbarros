document.addEventListener('DOMContentLoaded', () => {
  // Inicializar efecto de tipeo
  const typedEl = document.getElementById('typed-dev');

  if (typedEl) {
    if (typeof Typed !== 'undefined' && !localStorage.getItem('typedShown')) {
      new Typed('#typed-dev', {
        strings: [
          'DEV'
        ],
        typeSpeed: 100,
        backSpeed: 60,
        backDelay: 1500,
        loop: false,
        onComplete: () => {
          localStorage.setItem('typedShown', 'true');
        }
      });
    } else {
      typedEl.textContent = 'DEV';
    }
  }

  // Funcionalidad del menú móvil
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');

  if (mobileMenuToggle && mobileMenu) {
    mobileMenuToggle.addEventListener('click', () => {
      const isOpen = !mobileMenu.classList.contains('hidden');
      
      if (isOpen) {
        // Cerrar menú
        mobileMenu.classList.add('hidden');
        mobileMenuToggle.setAttribute('aria-expanded', 'false');
        // Resetear animación del botón hamburguesa
        const spans = mobileMenuToggle.querySelectorAll('span');
        spans.forEach(span => {
          span.classList.remove('rotate-45', '-rotate-45', 'opacity-0', 'translate-y-1.5', '-translate-y-1.5');
        });
      } else {
        // Abrir menú
        mobileMenu.classList.remove('hidden');
        mobileMenuToggle.setAttribute('aria-expanded', 'true');
        // Animar botón hamburguesa a X
        const spans = mobileMenuToggle.querySelectorAll('span');
        spans[0].classList.add('rotate-45', 'translate-y-1.5');
        spans[1].classList.add('opacity-0');
        spans[2].classList.add('-rotate-45', '-translate-y-1.5');
      }
    });

    // Cerrar menú al hacer clic en un enlace
    const mobileMenuLinks = mobileMenu.querySelectorAll('a');
    mobileMenuLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
        mobileMenuToggle.setAttribute('aria-expanded', 'false');
        // Resetear animación del botón hamburguesa
        const spans = mobileMenuToggle.querySelectorAll('span');
        spans.forEach(span => {
          span.classList.remove('rotate-45', '-rotate-45', 'opacity-0', 'translate-y-1.5', '-translate-y-1.5');
        });
      });
    });

    // Cerrar menú al redimensionar la ventana (cuando se pasa a desktop)
    window.addEventListener('resize', () => {
      if (window.innerWidth >= 768) { // md breakpoint
        mobileMenu.classList.add('hidden');
        mobileMenuToggle.setAttribute('aria-expanded', 'false');
        // Resetear animación del botón hamburguesa
        const spans = mobileMenuToggle.querySelectorAll('span');
        spans.forEach(span => {
          span.classList.remove('rotate-45', '-rotate-45', 'opacity-0', 'translate-y-1.5', '-translate-y-1.5');
        });
      }
    });
   }

  // Funcionalidad de header sticky con auto-hide
  const header = document.querySelector('.site-header');
  if (header) {
    let lastScrollTop = 0;
    let isScrolling = false;
    
    // Agregar clases iniciales
    header.classList.add('fixed', 'top-0', 'left-0', 'right-0', 'z-50', 'transition-transform', 'duration-300', 'ease-in-out');
    
    // Agregar padding-top al body para compensar el header fijo
    document.body.style.paddingTop = header.offsetHeight + 'px';
    
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      // Solo procesar si hay un cambio significativo en el scroll
      if (Math.abs(scrollTop - lastScrollTop) < 5) return;
      
      if (scrollTop > lastScrollTop && scrollTop > 100) {
        // Scrolling hacia abajo - ocultar header
        header.style.transform = 'translateY(-100%)';
      } else {
        // Scrolling hacia arriba - mostrar header
        header.style.transform = 'translateY(0)';
      }
      
      lastScrollTop = scrollTop;
    };
    
    // Throttle del evento scroll para mejor performance
    window.addEventListener('scroll', () => {
      if (!isScrolling) {
        window.requestAnimationFrame(() => {
          handleScroll();
          isScrolling = false;
        });
        isScrolling = true;
      }
    });
    
    // Ajustar padding cuando cambie el tamaño de la ventana
    window.addEventListener('resize', () => {
      document.body.style.paddingTop = header.offsetHeight + 'px';
    });
  }
});
