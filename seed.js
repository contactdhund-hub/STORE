const { neon } = require('@neondatabase/serverless');

async function seed() {
  const sql = neon(process.env.DATABASE_URL);
  try {
    const categories = ['T-Shirts', 'Hoodies', 'Jeans', 'Sneakers', 'Accessories'];
    for (const cat of categories) {
      await sql`INSERT INTO "Category" ("name", "updatedAt") VALUES (${cat}, NOW()) ON CONFLICT DO NOTHING`;
    }

    const mockProducts = [
      { name: "Classic White Tee", price: 1500, category: "T-Shirts", desc: "A comfortable classic white t-shirt.", images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800"], sizes: ["S", "M", "L", "XL"], colors: [{name: "White", hex: "#FFFFFF"}] },
      { name: "Graphic Black Tee", price: 1800, category: "T-Shirts", desc: "Black tee with a cool graphic.", images: ["https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800"], sizes: ["M", "L", "XL"], colors: [{name: "Black", hex: "#000000"}] },
      { name: "Vintage Oversized Tee", price: 2000, category: "T-Shirts", desc: "Oversized fit vintage style.", images: ["https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800"], sizes: ["L", "XL", "XXL"], colors: [{name: "Grey", hex: "#808080"}] },
      { name: "Premium Basic Tee", price: 1200, category: "T-Shirts", desc: "Premium cotton basic tee.", images: ["https://images.unsplash.com/photo-1564859228273-274232fdb516?w=800"], sizes: ["S", "M", "L"], colors: [{name: "Navy", hex: "#000080"}] },
      
      { name: "Cozy Fleece Hoodie", price: 3500, category: "Hoodies", desc: "Warm and cozy fleece hoodie.", images: ["https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800"], sizes: ["M", "L", "XL"], colors: [{name: "Grey", hex: "#A9A9A9"}] },
      { name: "Zip-up Black Hoodie", price: 3800, category: "Hoodies", desc: "Everyday zip-up hoodie.", images: ["https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?w=800"], sizes: ["S", "M", "L", "XL"], colors: [{name: "Black", hex: "#000000"}] },
      { name: "Streetwear Graphic Hoodie", price: 4200, category: "Hoodies", desc: "Heavyweight streetwear hoodie.", images: ["https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=800"], sizes: ["L", "XL"], colors: [{name: "Red", hex: "#FF0000"}] },
      { name: "Minimalist Cream Hoodie", price: 4000, category: "Hoodies", desc: "Clean minimalist design.", images: ["https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800"], sizes: ["M", "L"], colors: [{name: "Cream", hex: "#FFFDD0"}] },
      
      { name: "Slim Fit Blue Jeans", price: 2800, category: "Jeans", desc: "Classic slim fit denim.", images: ["https://images.unsplash.com/photo-1542272201-b1ca555f8505?w=800"], sizes: ["30", "32", "34", "36"], colors: [{name: "Blue", hex: "#0000FF"}] },
      { name: "Relaxed Fit Black Jeans", price: 3000, category: "Jeans", desc: "Comfortable relaxed fit.", images: ["https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800"], sizes: ["32", "34", "36"], colors: [{name: "Black", hex: "#000000"}] },
      { name: "Distressed Light Jeans", price: 3200, category: "Jeans", desc: "Trendy distressed denim.", images: ["https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?w=800"], sizes: ["28", "30", "32"], colors: [{name: "Light Blue", hex: "#ADD8E6"}] },
      { name: "Straight Leg Vintage Jeans", price: 3500, category: "Jeans", desc: "Vintage wash straight leg.", images: ["https://images.unsplash.com/photo-1604176354204-9268737828e4?w=800"], sizes: ["30", "32", "34"], colors: [{name: "Vintage Blue", hex: "#4682B4"}] },
      
      { name: "Classic White Sneakers", price: 5000, category: "Sneakers", desc: "Versatile everyday sneakers.", images: ["https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800"], sizes: ["8", "9", "10", "11"], colors: [{name: "White", hex: "#FFFFFF"}] },
      { name: "Running Shoes Red/Black", price: 6500, category: "Sneakers", desc: "Performance running shoes.", images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800"], sizes: ["9", "10", "11", "12"], colors: [{name: "Red", hex: "#FF0000"}] },
      { name: "High-Top Canvas Sneakers", price: 4500, category: "Sneakers", desc: "Classic high-top style.", images: ["https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800"], sizes: ["7", "8", "9", "10"], colors: [{name: "Black", hex: "#000000"}] },
      { name: "Chunky Lifestyle Sneakers", price: 7000, category: "Sneakers", desc: "Trendy chunky sole sneakers.", images: ["https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=800"], sizes: ["8", "9", "10"], colors: [{name: "Beige", hex: "#F5F5DC"}] },
      
      { name: "Leather Minimalist Wallet", price: 1500, category: "Accessories", desc: "Genuine leather slim wallet.", images: ["https://images.unsplash.com/photo-1627123424574-724758594e93?w=800"], sizes: ["One Size"], colors: [{name: "Brown", hex: "#8B4513"}] },
      { name: "Classic Aviator Sunglasses", price: 2500, category: "Accessories", desc: "Timeless aviator shades.", images: ["https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800"], sizes: ["One Size"], colors: [{name: "Gold", hex: "#FFD700"}] },
      { name: "Canvas Tote Bag", price: 1200, category: "Accessories", desc: "Durable everyday tote.", images: ["https://images.unsplash.com/photo-1597589827317-4c6d6e0a90bd?w=800"], sizes: ["One Size"], colors: [{name: "Natural", hex: "#F5DEB3"}] },
      { name: "Stainless Steel Watch", price: 8500, category: "Accessories", desc: "Elegant timepiece.", images: ["https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800"], sizes: ["One Size"], colors: [{name: "Silver", hex: "#C0C0C0"}] }
    ];

    for (const p of mockProducts) {
      const [product] = await sql`
        INSERT INTO "Product" ("name", "description", "price", "category", "inStock", "updatedAt")
        VALUES (${p.name}, ${p.desc}, ${p.price}, ${p.category}, true, NOW())
        RETURNING id
      `;

      for (const img of p.images) {
        await sql`INSERT INTO "ProductImage" ("url", "productId") VALUES (${img}, ${product.id})`;
      }
      for (const size of p.sizes) {
        await sql`INSERT INTO "ProductSize" ("name", "productId") VALUES (${size}, ${product.id})`;
      }
      for (const color of p.colors) {
        await sql`INSERT INTO "ProductColor" ("name", "hex", "productId") VALUES (${color.name}, ${color.hex}, ${product.id})`;
      }
    }
    console.log("Successfully seeded 20 mock products.");
  } catch(e) {
    console.error("Failed to seed", e);
  }
}
seed();
