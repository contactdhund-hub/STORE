import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding the database with admin and dummy products...');

  // 1. Clean existing (optional, but good for resetting)
  await prisma.product.deleteMany();

  // 2. Seed admin user
  const passwordHash = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: { passwordHash }, // In case it exists but needs password reset
    create: {
      email: 'admin@test.com',
      passwordHash,
      role: 'ADMIN',
    },
  });

  // 3. Insert mock data
  const products = [
    {
      name: "Straight Fit Jeans",
      description: "A comfortable, everyday essential.",
      price: 6990,
      category: "Straight Fit | Men",
      images: { create: [{ url: "https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=800&auto=format&fit=crop" }] },
      sizes: { create: [{ name: "30" }, { name: "32" }, { name: "34" }, { name: "36" }] },
      colors: { create: [{ name: "Light Blue", hex: "#7B96B4" }, { name: "Dark Blue", hex: "#1A2E4C" }, { name: "Black", hex: "#111111" }] },
    },
    {
      name: "Relaxed Fit Jeans",
      description: "Timeless style, durable construction.",
      price: 6990,
      category: "Relaxed Fit | Men",
      images: { create: [{ url: "https://images.unsplash.com/photo-1604176354204-9268737828e4?q=80&w=800&auto=format&fit=crop" }] },
      sizes: { create: [{ name: "30" }, { name: "32" }, { name: "34" }] },
      colors: { create: [{ name: "Washed Blue", hex: "#95A5A6" }] },
    },
    {
      name: "Slim Cropped Jeans",
      description: "Modern look.",
      price: 6490,
      category: "Slim Cropped | Men",
      images: { create: [{ url: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?q=80&w=800&auto=format&fit=crop" }] },
      sizes: { create: [{ name: "30" }, { name: "32" }, { name: "34" }] },
      colors: { create: [{ name: "Black", hex: "#222" }, { name: "Navy", hex: "#182035" }] },
    },
    {
      name: "Oversized Graphic Tee",
      description: "Heavyweight cotton with a bold graphic print.",
      price: 2490,
      category: "T-Shirts | Men",
      images: { create: [{ url: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=800&auto=format&fit=crop" }] },
      sizes: { create: [{ name: "S" }, { name: "M" }, { name: "L" }, { name: "XL" }] },
      colors: { create: [{ name: "Black", hex: "#111" }, { name: "White", hex: "#FFF" }] },
    },
    {
      name: "Classic Oxford Shirt",
      description: "Versatile button-down for any occasion.",
      price: 4990,
      category: "Shirts | Men",
      images: { create: [{ url: "/products/oxford_shirt.png" }] },
      sizes: { create: [{ name: "S" }, { name: "M" }, { name: "L" }, { name: "XL" }] },
      colors: { create: [{ name: "White", hex: "#FFF" }, { name: "Light Blue", hex: "#ADD8E6" }] },
    },
    {
      name: "Pleated Midi Skirt",
      description: "Elegant and flowing pleated design.",
      price: 5490,
      category: "Skirts | Women",
      images: { create: [{ url: "/products/midi_skirt.png" }] },
      sizes: { create: [{ name: "XS" }, { name: "S" }, { name: "M" }, { name: "L" }] },
      colors: { create: [{ name: "Beige", hex: "#F5F5DC" }, { name: "Black", hex: "#111" }] },
    },
    {
      name: "Linen Blend Dress",
      description: "Breathable summer dress with a relaxed fit.",
      price: 7990,
      category: "Dresses | Women",
      images: { create: [{ url: "https://images.unsplash.com/photo-1612336307429-8a898d10e223?q=80&w=800&auto=format&fit=crop" }] },
      sizes: { create: [{ name: "S" }, { name: "M" }, { name: "L" }] },
      colors: { create: [{ name: "Olive", hex: "#556B2F" }, { name: "White", hex: "#FFF" }] },
    },
    {
      name: "Knit Sweater",
      description: "Cozy knit sweater for chilly evenings.",
      price: 6490,
      category: "Knitwear | Unisex",
      images: { create: [{ url: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=800&auto=format&fit=crop" }] },
      sizes: { create: [{ name: "M" }, { name: "L" }, { name: "XL" }] },
      colors: { create: [{ name: "Cream", hex: "#FFFDD0" }, { name: "Grey", hex: "#808080" }] },
    },
    {
      name: "Cargo Pants",
      description: "Utility-inspired cargo pants with multiple pockets.",
      price: 5990,
      category: "Pants | Men",
      images: { create: [{ url: "/products/cargo_pants.png" }] },
      sizes: { create: [{ name: "30" }, { name: "32" }, { name: "34" }, { name: "36" }] },
      colors: { create: [{ name: "Khaki", hex: "#C3B091" }, { name: "Black", hex: "#111" }] },
    },
    {
      name: "Leather Crossbody Bag",
      description: "Minimalist leather bag for everyday essentials.",
      price: 8990,
      category: "Accessories | Women",
      images: { create: [{ url: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=800&auto=format&fit=crop" }] },
      sizes: { create: [{ name: "One Size" }] },
      colors: { create: [{ name: "Brown", hex: "#8B4513" }, { name: "Black", hex: "#111" }] },
    }
  ];

  for (const p of products) {
    await prisma.product.create({ data: p });
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
