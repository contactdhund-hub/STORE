import { getStoreSettings, updateStoreSettings } from "@/actions/settings";
import { Save } from "lucide-react";

export default async function SettingsPage() {
  const settings = await getStoreSettings();

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Store Settings</h1>
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-xl font-semibold mb-6">Shipping Configuration</h2>
        
        <form action={updateStoreSettings} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Base Shipping Fee (Rs.)
            </label>
            <input 
              type="number" 
              name="shippingFee"
              defaultValue={settings.shippingFee}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
            />
            <p className="text-sm text-slate-500 mt-1">Default fee applied to orders below the threshold.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Free Shipping Threshold (Rs.)
            </label>
            <input 
              type="number" 
              name="freeShippingThreshold"
              defaultValue={settings.freeShippingThreshold}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
            />
            <p className="text-sm text-slate-500 mt-1">Orders above this amount will get free shipping.</p>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button 
              type="submit"
              className="bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-slate-800 transition-colors flex items-center gap-2"
            >
              <Save size={18} />
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
