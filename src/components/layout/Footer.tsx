const InstagramIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    width="24"
    height="24"
  >
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 2.63-1.45 5.25-3.6 6.78-2.29 1.64-5.38 2.11-8.08 1.25-2.93-.93-5.22-3.32-5.96-6.26-.74-2.93.07-6.2 2.16-8.31 1.79-1.83 4.41-2.73 6.94-2.58V11.9c-1.34-.14-2.77.16-3.82.95-1.12.84-1.74 2.29-1.57 3.66.16 1.34 1.09 2.58 2.29 3.12 1.19.54 2.66.52 3.82-.12 1.23-.67 1.94-1.99 1.92-3.39-.03-4.71-.01-9.43-.01-14.15l-.01-1.95z"/>
  </svg>
);

export function Footer() {
  return (
    <footer className="border-t bg-gray-50 mt-12">
      <div className="container mx-auto px-4 py-12 md:py-16 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-lg font-semibold mb-4 text-black">Dhund</h3>
          <p className="text-sm text-gray-500 mb-6">Premium clothing for the modern individual.</p>
          <div className="flex gap-4">
            <a href="https://www.instagram.com/dhund_official/" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-black transition-colors">
              <InstagramIcon className="w-5 h-5" />
              <span className="sr-only">Instagram</span>
            </a>
            <a href="https://www.tiktok.com/@dhund_official" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-black transition-colors">
              <TikTokIcon className="w-5 h-5" />
              <span className="sr-only">TikTok</span>
            </a>
            <a href="https://www.facebook.com/profile.php?id=61591976647787&sk=about" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-black transition-colors">
              <FacebookIcon className="w-5 h-5" />
              <span className="sr-only">Facebook</span>
            </a>
          </div>
        </div>
        <div>
          <h4 className="font-medium mb-4 text-black">Shop</h4>
          <ul className="space-y-2 text-sm text-gray-500">
            <li><a href="#" className="hover:text-black transition-colors">Men&apos;s</a></li>
            <li><a href="#" className="hover:text-black transition-colors">Women&apos;s</a></li>
            <li><a href="#" className="hover:text-black transition-colors">Accessories</a></li>
            <li><a href="#" className="hover:text-black transition-colors">New Arrivals</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-medium mb-4 text-black">Support</h4>
          <ul className="space-y-2 text-sm text-gray-500">
            <li><a href="#" className="hover:text-black transition-colors">FAQ</a></li>
            <li><a href="#" className="hover:text-black transition-colors">Shipping & Returns</a></li>
            <li><a href="#" className="hover:text-black transition-colors">Contact Us</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-medium mb-4 text-black">Newsletter</h4>
          <p className="text-sm text-gray-500 mb-4">Subscribe for the latest updates and offers.</p>
          <div className="flex gap-2">
            <input type="email" placeholder="Email address" className="flex-1 rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
            <button className="bg-black text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors">Subscribe</button>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-200 py-6 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} Dhund. All rights reserved.
      </div>
    </footer>
  );
}
