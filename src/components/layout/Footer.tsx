export function Footer() {
  return (
    <footer className="border-t bg-gray-50 mt-12">
      <div className="container mx-auto px-4 py-12 md:py-16 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-lg font-semibold mb-4 text-black">Dhund</h3>
          <p className="text-sm text-gray-500">Premium clothing for the modern individual.</p>
        </div>
        <div>
          <h4 className="font-medium mb-4 text-black">Shop</h4>
          <ul className="space-y-2 text-sm text-gray-500">
            <li><a href="#" className="hover:text-black transition-colors">Men's</a></li>
            <li><a href="#" className="hover:text-black transition-colors">Women's</a></li>
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
