/**
 * Device Detection Utilities
 * Optimized for iPhone 17 Pro Max and mobile devices
 */

export interface DeviceInfo {
  isIPhone: boolean;
  isIPhone17ProMax: boolean;
  isIOS: boolean;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenWidth: number;
  screenHeight: number;
  pixelRatio: number;
  hasNotch: boolean;
  orientation: 'portrait' | 'landscape';
}

/**
 * Detect if device is iPhone
 */
export const isIPhone = (): boolean => {
  return /iPhone/i.test(navigator.userAgent);
};

/**
 * Detect if device is iPhone 17 Pro Max
 * Screen: 430x932px @ 3x pixel ratio
 */
export const isIPhone17ProMax = (): boolean => {
  if (!isIPhone()) return false;
  
  const width = window.screen.width;
  const height = window.screen.height;
  const pixelRatio = window.devicePixelRatio;
  
  // iPhone 17 Pro Max: 430x932 @ 3x
  return (
    (width === 430 && height === 932 && pixelRatio === 3) ||
    (width === 932 && height === 430 && pixelRatio === 3)
  );
};

/**
 * Detect if device is iOS
 */
export const isIOS = (): boolean => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
};

/**
 * Detect if device is mobile
 */
export const isMobile = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

/**
 * Detect if device is tablet
 */
export const isTablet = (): boolean => {
  return /iPad|Android/i.test(navigator.userAgent) && window.innerWidth >= 768;
};

/**
 * Detect if device is desktop
 */
export const isDesktop = (): boolean => {
  return !isMobile() && !isTablet();
};

/**
 * Detect if device has notch (safe area insets)
 */
export const hasNotch = (): boolean => {
  if (!isIOS()) return false;
  
  // Check if safe-area-inset-top is available
  const div = document.createElement('div');
  div.style.paddingTop = 'env(safe-area-inset-top)';
  document.body.appendChild(div);
  const hasInset = getComputedStyle(div).paddingTop !== '0px';
  document.body.removeChild(div);
  
  return hasInset;
};

/**
 * Get current orientation
 */
export const getOrientation = (): 'portrait' | 'landscape' => {
  return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
};

/**
 * Get comprehensive device information
 */
export const getDeviceInfo = (): DeviceInfo => {
  return {
    isIPhone: isIPhone(),
    isIPhone17ProMax: isIPhone17ProMax(),
    isIOS: isIOS(),
    isMobile: isMobile(),
    isTablet: isTablet(),
    isDesktop: isDesktop(),
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    pixelRatio: window.devicePixelRatio,
    hasNotch: hasNotch(),
    orientation: getOrientation(),
  };
};

/**
 * Add device-specific classes to body
 */
export const addDeviceClasses = (): void => {
  const info = getDeviceInfo();
  const classes: string[] = [];
  
  if (info.isIPhone) classes.push('is-iphone');
  if (info.isIPhone17ProMax) classes.push('is-iphone-17-pro-max');
  if (info.isIOS) classes.push('is-ios');
  if (info.isMobile) classes.push('is-mobile');
  if (info.isTablet) classes.push('is-tablet');
  if (info.isDesktop) classes.push('is-desktop');
  if (info.hasNotch) classes.push('has-notch');
  classes.push(`orientation-${info.orientation}`);
  
  document.body.classList.add(...classes);
};

/**
 * Listen for orientation changes
 */
export const onOrientationChange = (callback: (orientation: 'portrait' | 'landscape') => void): () => void => {
  const handler = () => {
    const orientation = getOrientation();
    document.body.classList.remove('orientation-portrait', 'orientation-landscape');
    document.body.classList.add(`orientation-${orientation}`);
    callback(orientation);
  };
  
  window.addEventListener('resize', handler);
  window.addEventListener('orientationchange', handler);
  
  return () => {
    window.removeEventListener('resize', handler);
    window.removeEventListener('orientationchange', handler);
  };
};

/**
 * Optimize viewport for iOS
 */
export const optimizeIOSViewport = (): void => {
  if (!isIOS()) return;
  
  // Prevent zoom on input focus
  const viewport = document.querySelector('meta[name=viewport]');
  if (viewport) {
    viewport.setAttribute('content', 
      'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes, viewport-fit=cover'
    );
  }
  
  // Fix iOS 100vh issue
  const setVH = () => {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  };
  
  setVH();
  window.addEventListener('resize', setVH);
  window.addEventListener('orientationchange', setVH);
};

/**
 * Log device information (for debugging)
 */
export const logDeviceInfo = (): void => {
  const info = getDeviceInfo();
  console.log('📱 Device Information:', {
    'Device Type': info.isIPhone17ProMax ? 'iPhone 17 Pro Max' : 
                   info.isIPhone ? 'iPhone' : 
                   info.isIOS ? 'iOS Device' : 
                   info.isMobile ? 'Mobile' : 
                   info.isTablet ? 'Tablet' : 'Desktop',
    'Screen Size': `${info.screenWidth}x${info.screenHeight}`,
    'Pixel Ratio': `${info.pixelRatio}x`,
    'Orientation': info.orientation,
    'Has Notch': info.hasNotch ? 'Yes' : 'No',
    'User Agent': navigator.userAgent
  });
};
