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
});
