import Image from "next/image";

type CartItem = {
  id: string;
  name: string;
  imageUrl: string;
  price: number;
  qty: number;
};

export default function CartItemRow({ item }: { item: CartItem }) {
  return (
    <div className="flex items-center gap-3">
      <Image
        src={item.imageUrl}
        alt={item.name}
        width={160}
        height={120}
        className="rounded-md object-cover"
        quality={90}
      />
      <div className="flex-1">
        <div className="font-medium">{item.name}</div>
        <div className="text-sm opacity-75">Qty: {item.qty}</div>
      </div>
      <div className="font-semibold">₹{item.price}.00</div>
    </div>
  );
}
