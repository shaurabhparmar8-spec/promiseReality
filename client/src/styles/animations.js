import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

// Animation configurations
export const animationConfig = {
  duration: 0.8,
  ease: "power2.out",
  stagger: 0.2,
};

// Add missing animateForm export to fix import error
export const animateForm = (element, options = {}) => {
  // Example simple animation for form elements
  gsap.fromTo(element,
    {
      opacity: 0,
      y: 20,
    },
    {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: "power2.out",
      ...options,
    }
  );
};

// Fade in animation
export const fadeIn = (element, options = {}) => {
  const config = { ...animationConfig, ...options };
  
  gsap.fromTo(element, 
    { 
      opacity: 0,
      y: options.y || 30
    },
    {
      opacity: 1,
      y: 0,
      duration: config.duration,
      ease: config.ease,
      scrollTrigger: {
        trigger: element,
        start: "top 80%",
        end: "bottom 20%",
        toggleActions: "play none none reverse",
        ...options.scrollTrigger
      }
    }
  );
};

// Slide up animation
export const slideUp = (element, options = {}) => {
  const config = { ...animationConfig, ...options };
  
  gsap.fromTo(element,
    {
      opacity: 0,
      y: 60,
      scale: 0.95
    },
    {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: config.duration,
      ease: config.ease,
      scrollTrigger: {
        trigger: element,
        start: "top 85%",
        end: "bottom 15%",
        toggleActions: "play none none reverse",
        ...options.scrollTrigger
      }
    }
  );
};

// Slide from left
export const slideFromLeft = (element, options = {}) => {
  const config = { ...animationConfig, ...options };
  
  gsap.fromTo(element,
    {
      opacity: 0,
      x: -60
    },
    {
      opacity: 1,
      x: 0,
      duration: config.duration,
      ease: config.ease,
      scrollTrigger: {
        trigger: element,
        start: "top 80%",
        end: "bottom 20%",
        toggleActions: "play none none reverse",
        ...options.scrollTrigger
      }
    }
  );
};

// Slide from right
export const slideFromRight = (element, options = {}) => {
  const config = { ...animationConfig, ...options };
  
  gsap.fromTo(element,
    {
      opacity: 0,
      x: 60
    },
    {
      opacity: 1,
      x: 0,
      duration: config.duration,
      ease: config.ease,
      scrollTrigger: {
        trigger: element,
        start: "top 80%",
        end: "bottom 20%",
        toggleActions: "play none none reverse",
        ...options.scrollTrigger
      }
    }
  );
};

// Stagger animation for multiple elements
export const staggerAnimation = (elements, options = {}) => {
  // Check if elements exist and have length
  if (!elements || elements.length === 0) {
    console.warn('staggerAnimation: No valid elements provided');
    return;
  }
  
  // Convert NodeList to Array if necessary
  const elementsArray = Array.isArray(elements) ? elements : Array.from(elements);
  
  // Filter out null/undefined elements
  const validElements = elementsArray.filter(el => el && el.nodeType === 1);
  
  if (validElements.length === 0) {
    console.warn('staggerAnimation: No valid DOM elements found');
    return;
  }
  
  const config = { ...animationConfig, ...options };
  
  try {
    gsap.fromTo(validElements,
      {
        opacity: 0,
        y: 40,
        scale: 0.9
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: config.duration,
        ease: config.ease,
        stagger: config.stagger,
        scrollTrigger: {
          trigger: validElements[0],
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse",
          ...options.scrollTrigger
        }
      }
    );
  } catch (error) {
    console.error('staggerAnimation error:', error);
  }
};

// Scale animation for cards
export const scaleIn = (element, options = {}) => {
  const config = { ...animationConfig, ...options };
  
  gsap.fromTo(element,
    {
      opacity: 0,
      scale: 0.8,
      rotation: -5
    },
    {
      opacity: 1,
      scale: 1,
      rotation: 0,
      duration: config.duration,
      ease: config.ease,
      scrollTrigger: {
        trigger: element,
        start: "top 85%",
        end: "bottom 15%",
        toggleActions: "play none none reverse",
        ...options.scrollTrigger
      }
    }
  );
};

// Parallax effect
export const parallax = (element, options = {}) => {
  gsap.to(element, {
    yPercent: -50,
    ease: "none",
    scrollTrigger: {
      trigger: element,
      start: "top bottom",
      end: "bottom top",
      scrub: true,
      ...options.scrollTrigger
    }
  });
};

// Text reveal animation
export const textReveal = (element, options = {}) => {
  const config = { ...animationConfig, ...options };
  
  gsap.fromTo(element,
    {
      opacity: 0,
      y: 100,
      skewY: 7
    },
    {
      opacity: 1,
      y: 0,
      skewY: 0,
      duration: config.duration,
      ease: config.ease,
      scrollTrigger: {
        trigger: element,
        start: "top 80%",
        end: "bottom 20%",
        toggleActions: "play none none reverse",
        ...options.scrollTrigger
      }
    }
  );
};

// Counter animation
export const counterAnimation = (element, endValue, options = {}) => {
  // Validate inputs
  if (!element || !element.nodeType) {
    console.warn('counterAnimation: Invalid element provided');
    return;
  }
  
  const numericEndValue = parseInt(endValue) || 0;
  if (numericEndValue === 0) {
    element.textContent = '0';
    return;
  }
  
  const config = { duration: 2, ...options };
  
  try {
    gsap.fromTo(element,
      { textContent: 0 },
      {
        textContent: numericEndValue,
        duration: config.duration,
        ease: "power2.out",
        snap: { textContent: 1 },
        scrollTrigger: {
          trigger: element,
          start: "top 80%",
          toggleActions: "play none none none",
          ...options.scrollTrigger
        }
      }
    );
  } catch (error) {
    console.error('counterAnimation error:', error);
    element.textContent = numericEndValue;
  }
};

// Hover animations for cards
export const cardHoverAnimation = (card) => {
  const image = card.querySelector('img');
  const content = card.querySelector('.card-content');
  
  card.addEventListener('mouseenter', () => {
    gsap.to(card, { y: -10, duration: 0.3, ease: "power2.out" });
    gsap.to(image, { scale: 1.05, duration: 0.3, ease: "power2.out" });
    gsap.to(content, { y: -5, duration: 0.3, ease: "power2.out" });
  });
  
  card.addEventListener('mouseleave', () => {
    gsap.to(card, { y: 0, duration: 0.3, ease: "power2.out" });
    gsap.to(image, { scale: 1, duration: 0.3, ease: "power2.out" });
    gsap.to(content, { y: 0, duration: 0.3, ease: "power2.out" });
  });
};

// Welcome section animation
export const welcomeAnimation = () => {
  const tl = gsap.timeline();
  
  tl.fromTo('.welcome-title',
    { opacity: 0, y: 100, scale: 0.8 },
    { opacity: 1, y: 0, scale: 1, duration: 1.2, ease: "power3.out" }
  )
  .fromTo('.welcome-subtitle',
    { opacity: 0, y: 50 },
    { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" },
    "-=0.6"
  )
  .fromTo('.welcome-cta',
    { opacity: 0, y: 30 },
    { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
    "-=0.4"
  )
  .fromTo('.scroll-indicator',
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" },
    "-=0.2"
  );
  
  // Floating animation for scroll indicator
  gsap.to('.scroll-indicator', {
    y: 10,
    duration: 1.5,
    ease: "power2.inOut",
    yoyo: true,
    repeat: -1
  });
  
  return tl;
};

// Navbar animation
export const navbarAnimation = () => {
  gsap.fromTo('.navbar',
    { y: -100, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.8, ease: "power2.out", delay: 0.5 }
  );
};

// Page transition animations
export const pageTransition = {
  enter: (element) => {
    gsap.fromTo(element,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
    );
  },
  
  exit: (element) => {
    return gsap.to(element, {
      opacity: 0,
      y: -20,
      duration: 0.4,
      ease: "power2.in"
    });
  }
};

// Utility function to refresh ScrollTrigger
export const refreshScrollTrigger = () => {
  ScrollTrigger.refresh();
};

// Utility function to kill all ScrollTriggers
export const killScrollTriggers = () => {
  ScrollTrigger.getAll().forEach(trigger => trigger.kill());
};

// Initialize all animations for a page
export const initPageAnimations = () => {
  // Refresh ScrollTrigger after images load
  window.addEventListener('load', () => {
    ScrollTrigger.refresh();
  });
  
  // Handle resize
  window.addEventListener('resize', () => {
    ScrollTrigger.refresh();
  });
};

export default {
  fadeIn,
  slideUp,
  slideFromLeft,
  slideFromRight,
  staggerAnimation,
  scaleIn,
  parallax,
  textReveal,
  counterAnimation,
  cardHoverAnimation,
  welcomeAnimation,
  navbarAnimation,
  pageTransition,
  refreshScrollTrigger,
  killScrollTriggers,
  initPageAnimations
};