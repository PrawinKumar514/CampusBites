import { menuItems } from '@/lib/data';
import OrderCustomizationForm from '@/components/order/OrderCustomizationForm';
import { notFound } from 'next/navigation';

export default function OrderPage({ params }: { params: { id: string } }) {
  const item = menuItems.find(m => m.id === params.id);

  if (!item) {
    notFound();
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <OrderCustomizationForm item={item} />
    </div>
  );
}
